#!/usr/bin/env python
"""Prepare a BigEarthNet-derived (or similar) dataset for VLM fine-tuning.

This is a Phase 9 scaffold — it defines the expected dataset shape and CLI
surface so the training pipeline can be filled in once the team has
selected/downloaded a dataset. It intentionally does NOT download anything
automatically (per project requirements): point --input at a local copy.

Usage:
    python training/prepare_dataset.py \\
        --input /path/to/BigEarthNet \\
        --output data/processed/bigearthnet_prepared \\
        --format instruction-tuning

Expected output shape (JSONL, one example per line):
    {"image_path": "...", "instruction": "Describe this scene.", "response": "..."}

Fill in `build_examples()` with the real BigEarthNet label-to-caption /
label-to-VQA-pair conversion logic once the label taxonomy in use is
finalized.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def build_examples(input_dir: Path) -> list[dict]:
    """Placeholder — replace with real BigEarthNet parsing.

    BigEarthNet ships per-patch multi-label land-cover annotations (JSON
    sidecar files alongside each Sentinel-2 patch). A real implementation
    should:
      1. Walk `input_dir` for patch folders / metadata files.
      2. Convert each patch's multi-label annotation into one or more
         (instruction, response) pairs — e.g. captioning ("Describe this
         scene." -> a sentence listing the present land-cover classes) and
         VQA ("Is there a water body in this scene?" -> "Yes"/"No").
      3. Return the flattened list of examples.
    """
    if not input_dir.exists():
        print(f"[prepare_dataset] Input directory '{input_dir}' does not exist — nothing to prepare.", file=sys.stderr)
        return []

    print(
        "[prepare_dataset] NOTE: build_examples() is a placeholder. "
        "Implement BigEarthNet-specific parsing here before running real training.",
        file=sys.stderr,
    )
    return []


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Path to the local BigEarthNet (or similar) dataset")
    parser.add_argument("--output", required=True, type=Path, help="Where to write the prepared JSONL dataset")
    parser.add_argument("--format", default="instruction-tuning", choices=["instruction-tuning"])
    args = parser.parse_args()

    examples = build_examples(args.input)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        for ex in examples:
            f.write(json.dumps(ex) + "\n")

    print(f"[prepare_dataset] Wrote {len(examples)} example(s) to {args.output}")


if __name__ == "__main__":
    main()
