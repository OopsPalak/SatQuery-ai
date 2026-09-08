"""Classifies a natural-language query into one of the supported task
types. Implemented as a reliable rule-based/keyword classifier behind a
narrow interface (`classify`) so it can be swapped for an ML or LLM-based
classifier later without touching call sites in the agent.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from app.schemas.common import TaskType

_CHANGE_KEYWORDS = [
    "chang", "increas", "decreas", "before", "after", "compare the two",
    "over time", "difference between", "grown", "shrunk", "expansion",
]
_GROUNDING_KEYWORDS = [
    "where is", "where are", "locate", "highlight", "find the", "find all",
    "point out", "show me the", "mark the",
]
_CAPTIONING_KEYWORDS = [
    "describe", "caption", "summarize the scene", "what does this scene",
    "give an overview", "tell me about this image",
]
_FUSION_KEYWORDS = [
    "sar", "radar", "backscatter", "optical and sar", "cross-modal", "cross modal",
    "fuse", "fusion", "combine optical",
]


@dataclass
class ClassificationResult:
    task: TaskType
    matched_keywords: list[str]
    reason: str


def _find_matches(text: str, keywords: list[str]) -> list[str]:
    return [kw for kw in keywords if kw in text]


def classify(query: str, image_count: int = 1, has_sar: bool = False) -> ClassificationResult:
    """Classify `query` into a TaskType, using image_count/has_sar as guard
    rails so we never route a single-image question to change detection or
    vice versa."""
    text = query.lower().strip()

    fusion_hits = _find_matches(text, _FUSION_KEYWORDS)
    change_hits = _find_matches(text, _CHANGE_KEYWORDS)
    grounding_hits = _find_matches(text, _GROUNDING_KEYWORDS)
    caption_hits = _find_matches(text, _CAPTIONING_KEYWORDS)

    # Guard rails from context first.
    if image_count >= 2 and has_sar:
        return ClassificationResult(
            TaskType.OPTICAL_SAR_ANALYSIS, fusion_hits, "Two images supplied, one optical and one SAR."
        )
    if image_count >= 2:
        return ClassificationResult(
            TaskType.CHANGE_DETECTION, change_hits, "Two images supplied — treated as a bi-temporal pair."
        )

    # Single-image routing driven by keywords.
    if fusion_hits and has_sar:
        return ClassificationResult(TaskType.OPTICAL_SAR_ANALYSIS, fusion_hits, "Query references SAR/cross-modal analysis.")
    if grounding_hits:
        return ClassificationResult(TaskType.REGION_GROUNDING, grounding_hits, "Query asks to locate/highlight a region.")
    if change_hits:
        # Single image but change-like language: still routed to VQA since
        # there's nothing to compare against, but flagged in the reason.
        return ClassificationResult(
            TaskType.SINGLE_IMAGE_VQA, change_hits, "Change-detection language detected but only one image supplied — answering as VQA."
        )
    if caption_hits:
        return ClassificationResult(TaskType.CAPTIONING, caption_hits, "Query asks for a description/summary of the scene.")

    return ClassificationResult(TaskType.SINGLE_IMAGE_VQA, [], "Default routing: open-ended question about a single image.")
