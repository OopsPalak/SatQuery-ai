"""Schemas for evidence, confidence and visualization artifacts shared by
every analysis endpoint."""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceLevel, Detection


class EvidenceItem(BaseModel):
    id: str
    label: str
    kind: str = Field(description="built-up | water | vegetation | change | bare-soil")
    confidence: float = Field(ge=0, le=1)
    bbox: list[float] | None = None


class Visualization(BaseModel):
    kind: str = Field(description="bounding_box | segmentation | change_heatmap | comparison")
    url: str
    label: str | None = None


class ConfidenceBreakdown(BaseModel):
    score: float = Field(ge=0, le=1)
    level: ConfidenceLevel
    model_confidence: float | None = Field(default=None, description="Raw model confidence, if the model exposes one")
    system_confidence: float = Field(description="System-level confidence combining model + heuristic factors")
    factors: list[str] = Field(default_factory=list)
