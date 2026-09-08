"""Builds the flat list of EvidenceItem cards the frontend renders under an
analysis result, from whatever a specialist model/baseline produced
(detections, change regions, or a scene-level classification).
"""
from __future__ import annotations

import uuid

from app.schemas.common import Detection
from app.schemas.results import EvidenceItem

_KIND_BY_LABEL = {
    "building": "built-up",
    "built-up": "built-up",
    "urban": "built-up",
    "road": "built-up",
    "water": "water",
    "river": "water",
    "lake": "water",
    "vegetation": "vegetation",
    "forest": "vegetation",
    "crop": "vegetation",
    "cropland": "vegetation",
    "bare soil": "bare-soil",
    "soil": "bare-soil",
    "change": "change",
}


def _kind_for(label: str) -> str:
    label_l = label.lower()
    for key, kind in _KIND_BY_LABEL.items():
        if key in label_l:
            return kind
    return "change"


def evidence_from_detections(detections: list[Detection]) -> list[EvidenceItem]:
    return [
        EvidenceItem(
            id=f"ev_{uuid.uuid4().hex[:8]}",
            label=f"{d.label.capitalize()} detected",
            kind=_kind_for(d.label),
            confidence=d.confidence,
            bbox=d.bbox,
        )
        for d in detections
    ]


def evidence_from_labels(labels: list[tuple[str, float]]) -> list[EvidenceItem]:
    """labels: [(label, confidence), ...] — used by VQA/captioning/change
    baselines that produce scene-level findings without pixel-precise boxes."""
    return [
        EvidenceItem(
            id=f"ev_{uuid.uuid4().hex[:8]}",
            label=label,
            kind=_kind_for(label),
            confidence=confidence,
        )
        for label, confidence in labels
    ]
