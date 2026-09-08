"""Produces a ConfidenceBreakdown for any analysis result.

Explicitly does not pretend to be a calibrated probability when the
underlying model doesn't provide one — `model_confidence` is left as
None in that case, and `system_confidence` is clearly a heuristic
combination of input-quality and task-reliability factors.
"""
from __future__ import annotations

from app.schemas.common import ConfidenceLevel
from app.schemas.results import ConfidenceBreakdown


def _level(score: float) -> ConfidenceLevel:
    if score >= 0.85:
        return ConfidenceLevel.HIGH
    if score >= 0.65:
        return ConfidenceLevel.MEDIUM
    return ConfidenceLevel.LOW


def estimate_confidence(
    *,
    model_confidence: float | None,
    has_valid_geo_metadata: bool,
    image_quality_ok: bool = True,
    task_reliability: float = 0.85,
) -> ConfidenceBreakdown:
    """Combine available signals into a single system confidence score.

    - If the model exposes its own confidence, it dominates the blend.
    - Otherwise we fall back entirely to heuristic factors (metadata
      validity, image quality, and a per-task reliability prior).
    """
    factors: list[str] = []

    heuristic = task_reliability
    if has_valid_geo_metadata:
        heuristic = min(1.0, heuristic + 0.05)
        factors.append("Valid geospatial metadata")
    else:
        heuristic = max(0.0, heuristic - 0.1)
        factors.append("Geospatial metadata missing or unverified")

    if image_quality_ok:
        factors.append("Acceptable image quality")
    else:
        heuristic = max(0.0, heuristic - 0.15)
        factors.append("Degraded image quality detected")

    if model_confidence is not None:
        factors.append("Model-reported confidence available")
        system_score = round(0.7 * model_confidence + 0.3 * heuristic, 4)
    else:
        factors.append("No calibrated model confidence — using heuristic estimate only")
        system_score = round(heuristic, 4)

    system_score = min(0.99, max(0.05, system_score))

    return ConfidenceBreakdown(
        score=system_score,
        level=_level(system_score),
        model_confidence=model_confidence,
        system_confidence=system_score,
        factors=factors,
    )
