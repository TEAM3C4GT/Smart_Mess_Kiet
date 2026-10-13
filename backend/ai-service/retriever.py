"""Lightweight retrieval over the project's own docs (RAG).

Keeps factual answers accurate and updatable without retraining: the fine-tune teaches
tone and the JSON contract, this layer supplies the facts. Degrades gracefully to no
context when the index or sentence-transformers is not present.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

INDEX_DIR = Path(__file__).resolve().parent / "index"
EMB_PATH = INDEX_DIR / "embeddings.npy"
CHUNKS_PATH = INDEX_DIR / "chunks.json"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_model = None
_chunks: list[dict[str, Any]] | None = None
_embeddings = None


def _load() -> bool:
    global _model, _chunks, _embeddings

    if _chunks is not None:
        return _model is not None

    if not (EMB_PATH.exists() and CHUNKS_PATH.exists()):
        _chunks = []
        return False

    try:
        import numpy as np
        from sentence_transformers import SentenceTransformer

        _embeddings = np.load(EMB_PATH)
        _chunks = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
        _model = SentenceTransformer(MODEL_NAME)
        return True
    except Exception as exc:  # missing deps or corrupt index
        print(f"[retriever] disabled: {exc}")
        _chunks = []
        _model = None
        return False


def retrieve(query: str, k: int = 4) -> list[dict[str, Any]]:
    """Return the top-k project-doc chunks most relevant to the query."""
    if not query or not _load():
        return []

    import numpy as np

    query_vec = _model.encode([query], normalize_embeddings=True)[0]
    scores = _embeddings @ query_vec
    top = np.argsort(scores)[::-1][:k]

    results = []
    for idx in top:
        if scores[idx] <= 0:
            continue
        chunk = _chunks[idx]
        results.append({"text": chunk["text"], "source": chunk.get("source", ""), "score": float(scores[idx])})
    return results


def context_block(query: str, k: int = 4) -> tuple[str, list[str]]:
    """Convenience wrapper returning an injectable text block plus source labels."""
    hits = retrieve(query, k=k)
    if not hits:
        return "", []
    lines = [f"[{hit['source']}] {hit['text']}" for hit in hits]
    sources = sorted({hit["source"] for hit in hits if hit["source"]})
    return "\n\n".join(lines), sources
