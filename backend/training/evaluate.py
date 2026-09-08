#!/usr/bin/env python
"""Evaluation scaffold for a fine-tuned remote-sensing VLM checkpoint.

Runs the model over a held-out JSONL split (same shape as
prepare_dataset.py's output) and reports simple exact-match / substring
accuracy for VQA-style examples. Extend with BLEU/CIDEr for captioning
and IoU for grounding once those evaluation sets exist.

Usage:
    python training/evaluate.py \\
        --dataset data/processed/bigearthnet_eval \\
        --checkpoint models/satquery-vlm-lora
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
    parser.add_argument("--checkpoint", required=True, type=Path)
    parser.add_argument("--base-model", default="Salesforce/blip-image-captioning-base")
    args = parser.parse_args()

    try:
        from transformers import AutoModelForVision2Seq, AutoProcessor
        from peft import PeftModel
        from PIL import Image
    except ImportError as exc:
        raise SystemExit("torch/transformers/peft/Pillow are required for evaluation.") from exc

    examples = load_jsonl(args.dataset)
    if not examples:
        raise SystemExit(f"No evaluation examples found at '{args.dataset}'.")

    processor = AutoProcessor.from_pretrained(args.base_model)
    base_model = AutoModelForVision2Seq.from_pretrained(args.base_model)
    model = PeftModel.from_pretrained(base_model, args.checkpoint)
    model.eval()

    correct = 0
    for ex in examples:
        image = Image.open(ex["image_path"]).convert("RGB")
        inputs = processor(images=image, text=ex.get("instruction", ""), return_tensors="pt")
        out = model.generate(**inputs, max_new_tokens=40)
        prediction = processor.decode(out[0], skip_special_tokens=True)
        expected = ex.get("response", "")
        if expected.strip().lower() in prediction.strip().lower():
            correct += 1

    accuracy = correct / len(examples)
    print(f"[evaluate] {correct}/{len(examples)} correct — accuracy: {accuracy:.2%}")


if __name__ == "__main__":
    main()
