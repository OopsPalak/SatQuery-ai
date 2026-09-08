"""Request/response schemas for every analysis endpoint:
/api/analyze, /api/analyze/caption, /api/analyze/ground, /api/analyze/change,
/api/analyze/multimodal (optical+SAR).
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.schemas.agent import ExecutionStep
from app.schemas.common import Detection
from app.schemas.results import ConfidenceBreakdown, EvidenceItem, Visualization
from app.schemas.upload import FileMetadata


# ---------------------------------------------------------------------------
# POST /api/analyze  (generic / auto-routed entry point)
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    file_ids: list[str] = Field(min_length=1, max_length=2)
    query: str = Field(min_length=1)
    mode: str = Field(default="auto", description="auto | single | change | fusion | grounding")


class AnalyzeResponse(BaseModel):
    analysis_id: str
    query: str
    task: str
    answer: str
    confidence: float
    confidence_breakdown: ConfidenceBreakdown
    evidence: list[EvidenceItem]
    visualizations: list[Visualization]
    execution_trace: list[ExecutionStep]
    metadata: dict[str, Any]
    model_used: str
    timestamp: str


# ---------------------------------------------------------------------------
# POST /api/analyze/caption
# ---------------------------------------------------------------------------
class CaptionRequest(BaseModel):
    file_id: str


class CaptionResponse(BaseModel):
    caption: str
    confidence: float
    evidence: list[EvidenceItem]
    execution_trace: list[ExecutionStep]


# ---------------------------------------------------------------------------
# POST /api/analyze/ground
# ---------------------------------------------------------------------------
class GroundingRequest(BaseModel):
    file_id: str
    query: str


class GroundingResponse(BaseModel):
    query: str
    detections: list[Detection]
    visualization_url: str | None = None
    confidence: float
    execution_trace: list[ExecutionStep]


# ---------------------------------------------------------------------------
# POST /api/analyze/change
# ---------------------------------------------------------------------------
class ChangeDetectionRequest(BaseModel):
    before_file_id: str
    after_file_id: str
    query: str = "What changed between these images?"


class ChangeRegion(BaseModel):
    label: str
    bbox: list[float]
    area_km2: float | None = None
    change_type: str = Field(description="increase | decrease")


class ChangeDetectionResponse(BaseModel):
    summary: str
    changed_area_percentage: float
    built_up_delta_pct: float
    vegetation_delta_pct: float
    water_delta_pct: float
    confidence: float
    regions: list[ChangeRegion]
    change_map_url: str | None = None
    before_image_url: str | None = None
    after_image_url: str | None = None
    execution_trace: list[ExecutionStep]


# ---------------------------------------------------------------------------
# POST /api/analyze/multimodal  (Optical + SAR)
# ---------------------------------------------------------------------------
class OpticalSarRequest(BaseModel):
    optical_file_id: str
    sar_file_id: str
    query: str = "What differences can you identify between optical and SAR?"


class OpticalSarResponse(BaseModel):
    answer: str
    optical_observations: list[str]
    sar_observations: list[str]
    fused_observations: list[str]
    confidence: float
    visualizations: list[Visualization]
    execution_trace: list[ExecutionStep]


# ---------------------------------------------------------------------------
# POST /api/demo/load
# ---------------------------------------------------------------------------
class DemoLoadResponse(BaseModel):
    scenes: list[FileMetadata]
    suggested_query: str
    suggested_mode: str
