"""Image captioning / scene description — the SIH-mandatory additional
single-image capability alongside VQA."""
from __future__ import annotations

from pathlib import Path

from app.models.vlm import get_vlm


def caption(image_path: Path) -> tuple[str, float]:
    vlm = get_vlm()
    return vlm.caption(image_path)
