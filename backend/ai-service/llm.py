"""LLM wrapper for the Mess Guide assistant.

Two backends, selected by the LLM_BACKEND env var (default: ollama):

  * ollama   - talks to a local Ollama server (recommended on Windows, where
               Smart App Control can block llama-cpp-python's native DLL).
  * llamacpp - loads a GGUF directly via llama-cpp-python.

Either way the model returns a strict JSON contract, parsed tolerantly:
    {"type": "answer", "text": "..."}  or  {"type": "action", "tool": "...", "args": {...}}
"""

from __future__ import annotations

import json
import os
import urllib.request
from pathlib import Path
from typing import Any

MODELS_DIR = Path(__file__).resolve().parent / "models"

BACKEND = os.getenv("LLM_BACKEND", "ollama").strip().lower()
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")

_model = None
_load_error: str | None = None


# ---------------------------------------------------------------------------
# Shared parsing
# ---------------------------------------------------------------------------
def _extract_json(text: str) -> dict[str, Any] | None:
    start = text.find("{")
    if start == -1:
        return None

    depth = 0
    in_string = False
    escaped = False
    for idx in range(start, len(text)):
        char = text[idx]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
        else:
            if char == '"':
                in_string = True
            elif char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:idx + 1])
                    except json.JSONDecodeError:
                        return None
    return None


def _normalise(parsed: dict[str, Any] | None, raw: str) -> dict[str, Any]:
    if isinstance(parsed, dict):
        if parsed.get("type") == "action" and isinstance(parsed.get("tool"), str):
            args = parsed.get("args")
            return {"type": "action", "tool": parsed["tool"], "args": args if isinstance(args, dict) else {}}
        # Some models emit the call as JSON text: {"name": "...", "parameters": {...}}
        name = parsed.get("name")
        if isinstance(name, str) and name:
            call_args = parsed.get("parameters") or parsed.get("arguments") or parsed.get("args")
            return {"type": "action", "tool": name, "args": call_args if isinstance(call_args, dict) else {}}
        # Accept the strict contract, and forgive looser shapes ("answer"/"reply"/...).
        for key in ("text", "answer", "reply", "response", "content", "message"):
            value = parsed.get(key)
            if isinstance(value, str) and value.strip():
                return {"type": "answer", "text": value.strip()}
    return {"type": "answer", "text": raw.strip()}


# ---------------------------------------------------------------------------
# Ollama backend
# ---------------------------------------------------------------------------
def _http_json(url: str, payload: dict[str, Any] | None, timeout: float) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _ollama_models() -> list[str]:
    try:
        data = _http_json(f"{OLLAMA_URL}/api/tags", None, timeout=4)
        return [m.get("name", "") for m in data.get("models", [])]
    except Exception:
        return []


def _ollama_ready() -> tuple[bool, str | None]:
    models = _ollama_models()
    if not models:
        return False, f"Ollama is not reachable at {OLLAMA_URL}. Start it with: ollama serve"
    # Ollama tags untagged models as ':latest', so 'foo' and 'foo:latest' are the same model.
    wanted = {OLLAMA_MODEL, f"{OLLAMA_MODEL}:latest"}
    if not wanted.intersection(models):
        return False, f"Ollama model '{OLLAMA_MODEL}' not found. Available: {', '.join(models) or 'none'}."
    return True, None


def _chat_ollama(messages: list[dict[str, str]], tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {"temperature": float(os.getenv("TEMPERATURE", "0.2"))},
    }
    if tools:
        payload["tools"] = tools
    else:
        payload["format"] = "json"

    data = _http_json(f"{OLLAMA_URL}/api/chat", payload, timeout=float(os.getenv("OLLAMA_TIMEOUT", "120")))
    message = data.get("message") or {}

    # Native tool call: the reliable path for small models.
    tool_calls = message.get("tool_calls") or []
    if tool_calls:
        function = (tool_calls[0] or {}).get("function") or {}
        name = function.get("name")
        args = function.get("arguments")
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}
        if isinstance(name, str):
            return {"type": "action", "tool": name, "args": args if isinstance(args, dict) else {}}

    content = message.get("content", "")
    return _normalise(_extract_json(content), content)


# ---------------------------------------------------------------------------
# llama.cpp backend
# ---------------------------------------------------------------------------
def model_path() -> str | None:
    env = os.getenv("MODEL_PATH")
    if env and Path(env).exists():
        return env
    if MODELS_DIR.exists():
        ggufs = sorted(MODELS_DIR.glob("*.gguf"))
        if ggufs:
            return str(ggufs[0])
    return None


def _build_prompt(messages: list[dict[str, str]]) -> str:
    # Qwen2.5 uses ChatML; building it explicitly avoids chat-template mismatches.
    parts = [f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>\n" for m in messages]
    parts.append("<|im_start|>assistant\n")
    return "".join(parts)


def _load_llamacpp() -> bool:
    global _model, _load_error

    if _model is not None:
        return True

    path = model_path()
    if not path:
        _load_error = "No GGUF model found. Run the training pipeline or set MODEL_PATH."
        return False

    try:
        from llama_cpp import Llama

        _model = Llama(
            model_path=path,
            n_ctx=int(os.getenv("N_CTX", "4096")),
            n_gpu_layers=int(os.getenv("N_GPU_LAYERS", "-1")),
            verbose=False,
        )
        return True
    except Exception as exc:
        _load_error = f"Failed to load model: {exc}"
        return False


def _chat_llamacpp(messages: list[dict[str, str]]) -> dict[str, Any]:
    if not _load_llamacpp():
        raise RuntimeError(_load_error or "Model unavailable.")

    result = _model(
        _build_prompt(messages),
        max_tokens=int(os.getenv("MAX_TOKENS", "512")),
        temperature=float(os.getenv("TEMPERATURE", "0.2")),
        top_p=0.9,
        stop=["<|im_end|>"],
    )
    raw = result["choices"][0]["text"]
    return _normalise(_extract_json(raw), raw)


def _chat_gemini(messages: list[dict[str, str]], api_key: str) -> dict[str, Any]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    contents = []
    for m in messages:
        contents.append({
            "role": "user" if m.get("role") in ("user", "system") else "model",
            "parts": [{"text": m.get("content", "")}]
        })
    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": "You are Mess Guide, the AI campus dining assistant for KIET Smart Mess & KFC. Answer concisely, helpfully, and accurately."}]
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return _normalise(_extract_json(text), text)


def _chat_fallback(messages: list[dict[str, str]]) -> dict[str, Any]:
    last_msg = messages[-1].get("content", "").lower() if messages else ""
    if any(k in last_msg for k in ("menu", "breakfast", "lunch", "dinner", "food")):
        return {"type": "action", "tool": "get_menu", "args": {}}
    if any(k in last_msg for k in ("kfc", "burger", "order")):
        return {"type": "action", "tool": "get_kfc_menu", "args": {}}
    if any(k in last_msg for k in ("forecast", "predict", "headcount")):
        return {"type": "action", "tool": "get_forecast", "args": {}}
    return {
        "type": "answer",
        "text": "Hello! I am Mess Guide, your KIET dining assistant. I can help with dining schedules, menus, KFC Express orders, and campus dining info."
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def is_available() -> bool:
    if os.getenv("GEMINI_API_KEY"):
        return True
    if BACKEND == "llamacpp":
        return model_path() is not None
    ok, _ = _ollama_ready()
    return ok


def load_error() -> str | None:
    if os.getenv("GEMINI_API_KEY"):
        return None
    if BACKEND == "llamacpp":
        return _load_error if _model is None else None
    ok, err = _ollama_ready()
    return None if ok else err


def backend_name() -> str:
    if os.getenv("GEMINI_API_KEY"):
        return "gemini-cloud"
    return BACKEND


def chat(messages: list[dict[str, str]], tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """Run the model and return a normalised {type, ...} dict.

    `tools` (OpenAI-style function defs) is only used by the Ollama backend; the
    llama.cpp backend relies on the fine-tuned JSON contract instead.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            return _chat_gemini(messages, gemini_key)
        except Exception:
            pass

    if BACKEND == "llamacpp" and _load_llamacpp():
        try:
            return _chat_llamacpp(messages)
        except Exception:
            pass

    if BACKEND == "ollama":
        ok, _ = _ollama_ready()
        if ok:
            try:
                return _chat_ollama(messages, tools)
            except Exception:
                pass

    return _chat_fallback(messages)
