"""Merge the trained LoRA adapter and export a quantised GGUF for serving.

Uses Unsloth's built-in GGUF export, which handles merging the adapter into the
base model and then quantising with llama.cpp.

Run inside the training virtualenv after train_unsloth.py:

    python export_gguf.py --adapter outputs/lora --quant q4_k_m

Output: ../models/<base>-<quant>.gguf  (served by the FastAPI ai-service)
"""

from __future__ import annotations

import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_OUT = HERE.parent / "models"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adapter", default=str(HERE / "outputs" / "lora"), help="Directory saved by train_unsloth.py")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help="Directory to write the GGUF into")
    parser.add_argument("--quant", default="q4_k_m", choices=["q4_k_m", "q5_k_m", "q8_0", "f16"])
    parser.add_argument("--max-seq-length", type=int, default=2048)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    adapter_dir = Path(args.adapter)
    if not adapter_dir.exists():
        raise SystemExit(f"Adapter not found at {adapter_dir}. Run train_unsloth.py first.")

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Unsloth's GGUF export requires a llama.cpp checkout; it will build one on first use.
    from unsloth import FastLanguageModel

    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=str(adapter_dir),
        max_seq_length=args.max_seq_length,
        load_in_4bit=True,
    )

    model.save_pretrained_gguf(str(out_dir), tokenizer, quantization_method=args.quant)

    produced = sorted(out_dir.glob("*.gguf"))
    print(f"GGUF written to {out_dir}:")
    for path in produced:
        print(f"  - {path.name}")
    print("Point the ai-service at it via MODEL_PATH, then: uvicorn main:app --port 8000")


if __name__ == "__main__":
    main()
