"""Text-guided region grounding: given an image and a natural-language
target ("find buildings", "highlight the water body"), return bounding
boxes.

The mock backend produces deterministic, plausible boxes sized relative to
the image dimensions so the frontend overlay always has something sensible
to draw during a demo. A real implementation would plug in an open-
vocabulary detector or the grounding head of a fine-tuned remote-sensing
VLM here, behind the same `ground()` function signature.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

from app.config import get_settings
from app.geospatial.raster import RasterInfo
from app.schemas.common import Detection

_TARGET_ALIASES = {
    "building": ["building", "buildings", "built-up", "urban", "structure"],
    "water": ["water", "river", "lake", "pond", "water body"],
    "vegetation": ["vegetation", "forest", "tree", "trees", "crop", "green"],
    "road": ["road", "roads", "highway", "street"],
}


def _resolve_target(query: str) -> str:
    q = query.lower()
    for canonical, aliases in _TARGET_ALIASES.items():
        if any(alias in q for alias in aliases):
            return canonical
    return "region of interest"


def _deterministic_boxes(image_path: Path, info: RasterInfo, n: int) -> list[list[float]]:
    digest = hashlib.sha256(str(image_path).encode()).hexdigest()
    boxes = []
    for i in range(n):
        seed = int(digest[i * 4 : i * 4 + 4], 16) / 0xFFFF
        w, h = info.width, info.height
        bw, bh = w * (0.18 + 0.1 * seed), h * (0.15 + 0.12 * seed)
        x1 = w * (0.1 + 0.55 * seed)
        y1 = h * (0.12 + 0.5 * (1 - seed))
        boxes.append([x1, y1, min(w, x1 + bw), min(h, y1 + bh)])
    return boxes


def ground(image_path: Path, query: str, info: RasterInfo) -> tuple[list[Detection], float]:
    settings = get_settings()
    target = _resolve_target(query)

    n_boxes = 1 if target != "region of interest" else 1
    boxes = _deterministic_boxes(image_path, info, n_boxes)

    confidence_by_target = {"water": 0.96, "building": 0.91, "vegetation": 0.89, "road": 0.84, "region of interest": 0.8}
    conf = confidence_by_target.get(target, 0.8)

    detections = [Detection(label=target, confidence=conf, bbox=box, area=_approx_area(box)) for box in boxes]
    return detections, conf


def _approx_area(box: list[float]) -> float:
    x1, y1, x2, y2 = box
    return round(abs((x2 - x1) * (y2 - y1)), 2)
