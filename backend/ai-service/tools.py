"""Tool registry and executor for the Mess Guide assistant.

The LLM never receives raw URL access. It may only name a tool from the whitelisted
schema in training/tools_schema.json; this module validates the tool and its arguments,
enforces the required role, and performs the actual backend call with the caller's JWT
so the existing Express RBAC guards stay authoritative.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path
from typing import Any

SCHEMA_PATH = Path(__file__).resolve().parent / "training" / "tools_schema.json"
BACKEND_BASE_URL = os.getenv("BACKEND_SERVICE_URL") or os.getenv("BACKEND_API_URL")
if not BACKEND_BASE_URL:
    vercel_url = os.getenv("VERCEL_URL")
    BACKEND_BASE_URL = f"https://{vercel_url}/api" if vercel_url else "http://localhost:5000/api"
BACKEND_API_URL = BACKEND_BASE_URL if BACKEND_BASE_URL.endswith("/api") else f"{BACKEND_BASE_URL.rstrip('/')}/api"

with SCHEMA_PATH.open(encoding="utf-8") as _fh:
    SCHEMA: dict[str, Any] = json.load(_fh)

TOOLS: dict[str, dict[str, Any]] = {tool["name"]: tool for tool in SCHEMA["tools"]}


class ToolError(Exception):
    """Raised when a tool call is unknown, mis-specified, or not permitted."""


SCOPES: dict[str, dict[str, Any]] = SCHEMA.get("scopes", {})
DEFAULT_SCOPE = "home"


def scope_config(scope: str | None) -> dict[str, Any]:
    """Resolve a dashboard scope. Unknown or missing scopes fall back to home."""
    if scope in SCOPES:
        return {"key": scope, **SCOPES[scope]}
    fallback = SCOPES.get(DEFAULT_SCOPE) or {"label": "Project", "focus": "the Smart Mess & KFC platform", "tools": ["*"]}
    return {"key": DEFAULT_SCOPE, **fallback}


def scope_tool_names(scope: str | None) -> set[str] | None:
    """Tool names permitted for a scope, or None meaning 'all tools'."""
    names = scope_config(scope).get("tools") or ["*"]
    return None if "*" in names else set(names)


def in_scope(tool_name: str, scope: str | None) -> bool:
    allowed = scope_tool_names(scope)
    return allowed is None or tool_name in allowed


def _tool_block(scope: str | None = None) -> str:
    allowed = scope_tool_names(scope)
    lines = []
    for tool in SCHEMA["tools"]:
        if allowed is not None and tool["name"] not in allowed:
            continue
        args = ", ".join(tool.get("args", {}).keys()) or "none"
        lines.append(f"- {tool['name']}: {tool['description']} (args: {args})")
    return "\n".join(lines)


def scope_system_prompt(scope: str | None) -> str:
    """Identity plus a dashboard-scoped, out-of-scope-refusing prompt (native tool backends)."""
    cfg = scope_config(scope)
    return (
        f"You are 'Mess Guide', the assistant embedded in the {cfg['label']} of the "
        "KIET Smart Mess & KFC Campus OS. "
        f"You ONLY help with {cfg['focus']}. "
        "If the user asks about anything outside that, politely decline and say you can only help "
        f"with topics for the {cfg['label']}. "
        "Answer briefly and concretely. Always use the provided tools for live data or numbers - "
        "never invent figures. Never reveal secrets."
    )


_JSON_CONTRACT = (
    "Reply with a single strict JSON object and nothing else: "
    '{"type":"answer","text":"..."} to answer, or '
    '{"type":"action","tool":"<tool_name>","args":{...}} to fetch data or act. '
    "Use only these tools:\n"
)


def contract_system_prompt(scope: str | None) -> str:
    """Scope prompt plus the strict JSON contract the fine-tuned llama.cpp model expects."""
    return scope_system_prompt(scope) + "\n\n" + _JSON_CONTRACT + _tool_block(scope)


def chat_tools(scope: str | None = None) -> list[dict[str, Any]]:
    """Tool definitions in OpenAI/Ollama function-calling format, filtered by scope."""
    allowed = scope_tool_names(scope)
    defs = []
    for tool in SCHEMA["tools"]:
        if allowed is not None and tool["name"] not in allowed:
            continue
        properties: dict[str, Any] = {}
        required: list[str] = []
        for name, spec in tool.get("args", {}).items():
            properties[name] = {k: spec[k] for k in ("type", "description", "enum") if k in spec}
            if spec.get("required"):
                required.append(name)
        defs.append({
            "type": "function",
            "function": {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": {"type": "object", "properties": properties, "required": required},
            },
        })
    return defs


def role_allowed(tool: dict[str, Any], role: str | None) -> bool:
    required = tool.get("requiredRole")
    if not required:
        return True
    if role in ("Admin", "Principal"):
        return True
    return role in required


def _substitute_path(tool: dict[str, Any], args: dict[str, Any]) -> str:
    path = tool["http"]["path"]
    for param in tool["http"].get("pathParams", []):
        value = args.get(param)
        if param == "date" and not value:
            value = date.today().isoformat()
        if value is None:
            raise ToolError(f"Missing required path parameter '{param}' for tool '{tool['name']}'.")
        path = path.replace("{" + param + "}", urllib.parse.quote(str(value)))
    return path


def _query_string(tool: dict[str, Any], args: dict[str, Any]) -> str:
    query_keys = tool["http"].get("query", [])
    query = {key: args[key] for key in query_keys if args.get(key) is not None}
    return ("?" + urllib.parse.urlencode(query)) if query else ""


def execute(tool_name: str, args: dict[str, Any], token: str | None, role: str | None) -> dict[str, Any]:
    """Run a read tool, or return a descriptor for write/ui tools the app handles."""
    tool = TOOLS.get(tool_name)
    if not tool:
        raise ToolError(f"Unknown tool '{tool_name}'.")

    if not role_allowed(tool, role):
        required = ", ".join(tool.get("requiredRole") or [])
        raise ToolError(f"This action requires one of these roles: {required}.")

    kind = tool["kind"]

    if kind == "ui":
        return {"type": "ui", "tool": tool_name, "args": args}

    if kind == "write":
        # Do not execute writes server-side: the client shows a confirm card and calls the
        # real endpoint itself, so the user is always in control of mutating actions.
        return {"type": "pending_action", "tool": tool_name, "args": args, "requiredRole": tool.get("requiredRole")}

    url = BACKEND_API_URL + _substitute_path(tool, args) + _query_string(tool, args)
    headers = {"User-Agent": "SmartMess-MessGuide/1.0", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(url, headers=headers, method=tool["http"]["method"])
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            body = response.read().decode("utf-8")
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                data = {"raw": body}
            return {"type": "data", "tool": tool_name, "status": response.status, "data": data}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")[:400]
        return {"type": "data", "tool": tool_name, "status": exc.code, "error": detail}
    except Exception as exc:  # network/timeout
        return {"type": "data", "tool": tool_name, "status": 0, "error": str(exc)}
