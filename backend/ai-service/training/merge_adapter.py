"""Merge the trained LoRA adapter into the base model as 16-bit safetensors.

Used to feed Ollama, which on Windows can import a merged HF model directory
(`ollama create --experimental`) without needing a local llama.cpp build.

    python merge_adapter.py --adapter outputs/lora --out outputs/merged
"""

from __future__ import annotations

import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adapter", default=str(HERE / "outputs" / "lora"))
    parser.add_argument("--out", default=str(HERE / "outputs" / "merged"))
    parser.add_argument("--max-seq-length", type=int, default=2048)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    adapter_dir = Path(args.adapter)
    if not adapter_dir.exists():
        raise SystemExit(f"Adapter not found at {adapter_dir}. Run train_unsloth.py first.")

    from unsloth import FastLanguageModel

    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=str(adapter_dir),
        max_seq_length=args.max_seq_length,
        load_in_4bit=True,
    )

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    model.save_pretrained_merged(str(out_dir), tokenizer, save_method="merged_16bit")
    print(f"Merged 16-bit model written to {out_dir}")


if __name__ == "__main__":
    main()
