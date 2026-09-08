#!/usr/bin/env python
"""LoRA fine-tuning scaffold for the remote-sensing VLM.

Loads a base Hugging Face vision-language model, wraps it with a PEFT LoRA
adapter, and fine-tunes on the JSONL dataset produced by
prepare_dataset.py. This is Phase 9 scaffolding: the training loop is
functional but minimal — extend it with proper batching, mixed precision,
checkpointing cadence, and eval-during-training as needed.

Usage:
    python training/train_lora.py \\
        --dataset data/processed/bigearthnet_prepared \\
        --base-model Salesforce/blip-image-captioning-base \\
        --output models/satquery-vlm-lora \\
        --epochs 3

Requires the AI/ML extras from requirements.txt (torch, transformers,
datasets, peft) to be installed — not needed for the mock-inference demo
backend.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path) as f:
        return [json.loads(line) for line in f if line.strip()]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--base-model", default="Salesforce/blip-image-captioning-base")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--lora-r", type=int, default=8)
    parser.add_argument("--lora-alpha", type=int, default=16)
    args = parser.parse_args()

    try:
        import torch
        from peft import LoraConfig, get_peft_model
        from transformers import AutoModelForVision2Seq, AutoProcessor
    except ImportError as exc:
        raise SystemExit(
            "torch/transformers/peft are required for training. "
            "Install the AI/ML section of requirements.txt first."
        ) from exc

    examples = load_jsonl(args.dataset)
    if not examples:
        raise SystemExit(
            f"No examples found at '{args.dataset}'. Run prepare_dataset.py first "
            "(and implement build_examples() for your chosen dataset)."
        )

    print(f"[train_lora] Loaded {len(examples)} training examples.")
    print(f"[train_lora] Loading base model '{args.base_model}'...")

    processor = AutoProcessor.from_pretrained(args.base_model)
    model = AutoModelForVision2Seq.from_pretrained(args.base_model)

    lora_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        target_modules=["q_proj", "v_proj"],  # adjust to match the chosen backbone's attention module names
        lora_dropout=0.05,
        bias="none",
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # NOTE: a minimal, illustrative training loop. Replace with a proper
    # Trainer/accelerate-based loop (with a DataLoader, image loading,
    # gradient accumulation, checkpoint-on-improvement, etc.) for real runs.
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
    print(f"[train_lora] Scaffolded {args.epochs}-epoch training loop over {len(examples)} examples.")
    print("[train_lora] Fill in the batch/image-loading logic for your chosen dataset format before running for real.")

    args.output.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(args.output)
    processor.save_pretrained(args.output)
    print(f"[train_lora] Adapter (scaffold) saved to {args.output}")
    print("[train_lora] Point VLM_CHECKPOINT_PATH in .env at this directory to load it in the backend.")


if __name__ == "__main__":
    main()
