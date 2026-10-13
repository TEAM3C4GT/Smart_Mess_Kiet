"""QLoRA fine-tune of Qwen2.5-Instruct on the Mess Guide dataset, using Unsloth.

Run inside the training virtualenv:

    python train_unsloth.py --model Qwen/Qwen2.5-1.5B-Instruct --epochs 2 \
        --batch-size 1 --grad-accum 8 --max-seq-length 2048

6 GB GPU (e.g. RTX 3050 Laptop) -> use the 1.5B model. A 3B model needs a larger GPU.
Output: outputs/lora (adapter + tokenizer). Convert to GGUF next with export_gguf.py.

The trainer/config arguments are filtered against the installed trl/transformers
signatures so the script keeps working across their API changes (e.g. trl 1.x renamed
`tokenizer` to `processing_class` and transformers v5 dropped `warmup_ratio`).
"""

from __future__ import annotations

import argparse
import inspect
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / "data"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="Qwen/Qwen2.5-1.5B-Instruct",
                        help="Base model, e.g. Qwen/Qwen2.5-1.5B-Instruct or Qwen/Qwen2.5-3B-Instruct")
    parser.add_argument("--epochs", type=float, default=2.0)
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--grad-accum", type=int, default=8)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--max-seq-length", type=int, default=2048)
    parser.add_argument("--output-dir", default=str(HERE / "outputs" / "lora"))
    return parser.parse_args()


def _accepted(cls) -> set[str]:
    return set(inspect.signature(cls.__init__).parameters)


def main() -> None:
    args = parse_args()

    from unsloth import FastLanguageModel
    from unsloth.chat_templates import get_chat_template
    from datasets import load_dataset
    from trl import SFTTrainer

    try:
        from trl import SFTConfig as ConfigClass
    except ImportError:  # older trl keeps config on TrainingArguments
        from transformers import TrainingArguments as ConfigClass

    train_file = DATA_DIR / "guide_train.jsonl"
    if not train_file.exists():
        raise SystemExit(f"Missing {train_file}. Run: python build_dataset.py")

    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=args.model,
        max_seq_length=args.max_seq_length,
        load_in_4bit=True,
    )

    model = FastLanguageModel.get_peft_model(
        model,
        r=16,
        lora_alpha=16,
        lora_dropout=0.0,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        use_gradient_checkpointing="unsloth",
        random_state=3407,
    )

    tokenizer = get_chat_template(tokenizer, chat_template="qwen-2.5")

    def to_text(batch):
        return {
            "text": [
                tokenizer.apply_chat_template(convo, tokenize=False, add_generation_prompt=False)
                for convo in batch["messages"]
            ]
        }

    dataset = load_dataset("json", data_files=str(train_file), split="train").map(to_text, batched=True)

    eval_file = DATA_DIR / "guide_eval.jsonl"
    eval_dataset = None
    if eval_file.exists():
        eval_dataset = load_dataset("json", data_files=str(eval_file), split="train").map(to_text, batched=True)

    desired = {
        "output_dir": str(HERE / "outputs" / "checkpoints"),
        "per_device_train_batch_size": args.batch_size,
        "gradient_accumulation_steps": args.grad_accum,
        "num_train_epochs": args.epochs,
        "learning_rate": args.lr,
        "lr_scheduler_type": "cosine",
        "warmup_ratio": 0.03,
        "warmup_steps": 5,
        "logging_steps": 5,
        "save_strategy": "epoch",
        "optim": "adamw_8bit",
        "weight_decay": 0.01,
        "bf16": True,
        "report_to": "none",
        "seed": 3407,
        "max_seq_length": args.max_seq_length,
        "dataset_text_field": "text",
    }

    accepted_cfg = _accepted(ConfigClass)
    config_kwargs = {k: v for k, v in desired.items() if k in accepted_cfg}
    if "warmup_ratio" not in config_kwargs and "warmup_steps" in accepted_cfg:
        config_kwargs["warmup_steps"] = 5
    config = ConfigClass(**config_kwargs)

    accepted_trainer = _accepted(SFTTrainer)
    trainer_kwargs = {"model": model, "args": config, "train_dataset": dataset}
    if eval_dataset is not None:
        trainer_kwargs["eval_dataset"] = eval_dataset
    if "processing_class" in accepted_trainer:
        trainer_kwargs["processing_class"] = tokenizer
    elif "tokenizer" in accepted_trainer:
        trainer_kwargs["tokenizer"] = tokenizer
    for key in ("dataset_text_field", "max_seq_length"):
        if key in accepted_trainer and key not in config_kwargs:
            trainer_kwargs[key] = desired[key]

    trainer = SFTTrainer(**trainer_kwargs)
    trainer.train()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(str(out_dir))
    tokenizer.save_pretrained(str(out_dir))
    print(f"Saved LoRA adapter to {out_dir}")
    print("Next: python export_gguf.py")


if __name__ == "__main__":
    main()
