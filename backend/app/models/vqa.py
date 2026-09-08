"""Single-image Visual Question Answering.

Thin, explicit wrapper around RemoteSensingVLM.answer_question so the
route layer and the agent depend on a stable `answer` function rather than
reaching into the VLM facade directly — makes it trivial to later swap in
a dedicated VQA-specialist model distinct from the captioning model.
"""
from __future__ import annotations

from pathlib import Path

from app.models.vlm import get_vlm


def answer(image_path: Path, question: str) -> tuple[str, float]:
    vlm = get_vlm()
    return vlm.answer_question(image_path, question)


def scene_labels(image_path: Path) -> list[tuple[str, float]]:
    vlm = get_vlm()
    return vlm.scene_labels(image_path)
