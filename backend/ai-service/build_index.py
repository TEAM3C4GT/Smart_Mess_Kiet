"""Build the RAG index over the project's docs.

Chunks the source documents and embeds them with all-MiniLM-L6-v2, persisting the
vectors and chunk metadata into ai-service/index/. Re-run whenever the docs change.

    pip install sentence-transformers numpy
    python build_index.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
INDEX_DIR = HERE / "index"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_SIZE = 600
CHUNK_OVERLAP = 80

SOURCES = [
    "README.md",
    "COMMANDS.md",
    "backend/src/routes/apiRoutes.js",
    "backend/src/models/Schemas.js",
    "backend/ai-service/training/tools_schema.json",
    "frontend/src/pages/HomePage.jsx",
]


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    text = text.strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - overlap
    return chunks


def main() -> None:
    records: list[dict] = []
    for rel in SOURCES:
        path = REPO_ROOT / rel
        if not path.exists():
            print(f"skip (missing): {rel}")
            continue
        for piece in chunk_text(path.read_text(encoding="utf-8", errors="ignore")):
            records.append({"source": rel, "text": piece})

    if not records:
        raise SystemExit("No source documents found; aborting.")

    model = SentenceTransformer(MODEL_NAME)
    embeddings = model.encode(
        [r["text"] for r in records],
        normalize_embeddings=True,
        show_progress_bar=True,
    )

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    np.save(INDEX_DIR / "embeddings.npy", np.asarray(embeddings, dtype=np.float32))
    (INDEX_DIR / "chunks.json").write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Indexed {len(records)} chunks from {len(SOURCES)} files into {INDEX_DIR}")


if __name__ == "__main__":
    main()
