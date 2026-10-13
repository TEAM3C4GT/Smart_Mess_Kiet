"""FastAPI router for the Mess Guide chat.

Flow: RAG context -> LLM (strict-JSON contract) -> deterministic tool executor.
Read tools are executed here with the caller's JWT forwarded to the Express API;
write tools are returned as a descriptor so the client can confirm before mutating.
"""

from __future__ import annotations

import json
import re
from typing import Any, List, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

import llm
import retriever
import tools

router = APIRouter()

MAX_HISTORY = 8
MAX_SOURCES = 4


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    role: Optional[str] = None
    scope: Optional[str] = None


def _bearer_token(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def _format_result(tool_name: str, result: dict[str, Any]) -> str:
    status = result.get("status")
    if status != 200:
        detail = result.get("error") or f"HTTP {status}"
        return f"I couldn't fetch that for you ({tool_name}): {detail}"

    data = result.get("data") or {}

    if tool_name == "get_menu":
        meals = {k: data.get(k) for k in ("breakfast", "lunch", "snacks", "dinner") if data.get(k)}
        if meals:
            return "Today's menu - " + "; ".join(f"{k.title()}: {v}" for k, v in meals.items()) + "."
        return "Here is the current menu: " + json.dumps(data)[:400]

    if tool_name == "get_forecast" and data.get("predictedCount") is not None:
        batch = data.get("kitchenBatch", {})
        return (
            f"Forecast for {data.get('meal', 'the meal')}: about {data['predictedCount']} diners "
            f"({data.get('confidence', '?')}% confidence, buffer {data.get('bufferPortions', '?')} portions, "
            f"prep target {data.get('prepTarget', '?')}). Batch: rice {batch.get('rawRiceKg', '?')} kg, "
            f"dal {batch.get('dalLiters', '?')} L, veg/paneer {batch.get('vegPaneerKg', '?')} kg, "
            f"rotis {batch.get('rotisPcs', '?')}."
        )

    if tool_name == "get_wastage":
        trend = data.get("wastageTrend") or data.get("wastage") or []
        if isinstance(trend, list) and trend:
            return f"Latest wastage data has {len(trend)} points. Most recent: {json.dumps(trend[-1])[:300]}"
        return "Here is the wastage data: " + json.dumps(data)[:400]

    if tool_name == "get_block_performance":
        rows = [r for r in (data.get("blockPerformance") or []) if isinstance(r, dict)]
        if rows:
            ranked = sorted(rows, key=lambda r: r.get("rate", 0), reverse=True)
            top = ranked[0]
            listing = "; ".join(
                f"{r.get('block', 'Block')}: {r.get('rate', '?')}% ({r.get('status', '')})" for r in ranked
            )
            return f"Highest participation: {top.get('block')} at {top.get('rate')}%. All blocks - {listing}."
        return "Here is the block performance: " + json.dumps(data)[:400]

    if tool_name == "get_kfc_menu":
        items = [i for i in (data.get("menu") or []) if isinstance(i, dict)]
        priced = sorted([i for i in items if isinstance(i.get("price"), (int, float))], key=lambda i: i["price"])
        if priced:
            listing = "; ".join(f"{i.get('name')} Rs.{i.get('price')}" for i in priced)
            cheapest, priciest = priced[0], priced[-1]
            return (
                f"KFC menu ({len(priced)} items): {listing}. "
                f"Cheapest: {cheapest.get('name')} (Rs.{cheapest.get('price')}). "
                f"Priciest: {priciest.get('name')} (Rs.{priciest.get('price')})."
            )
        return "Here is the KFC menu: " + json.dumps(data)[:400]

    compact = json.dumps(data)
    if len(compact) > 500:
        compact = compact[:500] + "..."
    return f"Here's what I found ({tool_name}): {compact}"


def _as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("true", "yes", "1", "on")
    return bool(value)


def _action_summary(tool_name: str, args: dict[str, Any]) -> str:
    if tool_name == "set_meal_selection":
        meal = str(args.get("meal", "the meal"))
        verb = "Opt in to" if _as_bool(args.get("selected")) else "Opt out of"
        date = args.get("date")
        suffix = f" for {date}" if isinstance(date, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", date) else ""
        return f"{verb} {meal}{suffix}"
    if tool_name == "place_kfc_order":
        items = args.get("items") or []
        parts = [
            f"{item.get('qty', 1)}x {item.get('name', 'item')}"
            for item in items
            if isinstance(item, dict)
        ]
        return "Place a KFC order for " + (", ".join(parts) if parts else "an item")
    if tool_name == "cancel_kfc_order":
        return f"Cancel KFC order {args.get('id', '')}".strip()
    return tool_name.replace("_", " ")


@router.post("/chat")
def chat(payload: ChatRequest, authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    if not llm.is_available():
        raise HTTPException(
            status_code=503,
            detail=llm.load_error() or "The Mess Guide model is not available yet.",
        )

    history = [{"role": m.role, "content": m.content} for m in payload.messages][-MAX_HISTORY:]
    user_query = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")

    native_tools = llm.backend_name() != "llamacpp"
    context, sources = retriever.context_block(user_query, k=MAX_SOURCES)
    system = tools.scope_system_prompt(payload.scope) if native_tools else tools.contract_system_prompt(payload.scope)
    if context:
        system += "\n\nPROJECT CONTEXT (authoritative, cite only if helpful):\n" + context

    messages = [{"role": "system", "content": system}] + history

    try:
        decision = llm.chat(messages, tools=tools.chat_tools(payload.scope) if native_tools else None)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    if decision["type"] != "action":
        return {"reply": decision["text"], "sources": sources}

    tool_name = decision["tool"]
    token = _bearer_token(authorization)

    if not tools.in_scope(tool_name, payload.scope):
        label = tools.scope_config(payload.scope)["label"]
        return {
            "reply": f"That's outside what I can do on the {label}. I can only help with {label} topics here.",
            "sources": sources,
        }

    try:
        result = tools.execute(tool_name, decision["args"], token, payload.role)
    except tools.ToolError as exc:
        return {"reply": str(exc), "action": decision, "sources": sources}

    if result["type"] == "pending_action":
        summary = _action_summary(tool_name, decision["args"])
        return {
            "reply": f"I can do that - please confirm: {summary}.",
            "action": {**result, "summary": summary},
            "sources": sources,
        }

    if result["type"] == "ui":
        page = result["args"].get("page", "/")
        return {"reply": f"Opening {page}.", "action": result, "sources": sources}

    return {
        "reply": _format_result(tool_name, result),
        "action": decision,
        "data": result.get("data"),
        "sources": sources,
    }


class VoiceRequest(BaseModel):
    # Placeholder for the deferred voice phase: base64-encoded audio (<= ~30s).
    audio: str


@router.post("/chat/voice")
def chat_voice(_: VoiceRequest) -> dict[str, Any]:
    raise HTTPException(
        status_code=501,
        detail="Voice input is not enabled yet. Type your question for now.",
    )
