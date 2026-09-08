"""Shared schemas: error envelope and common enums used across modules."""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class ErrorCode(str, Enum):
    UNSUPPORTED_FILE = "UNSUPPORTED_FILE"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    TOO_MANY_FILES = "TOO_MANY_FILES"
    CORRUPTED_IMAGE = "CORRUPTED_IMAGE"
    FILE_NOT_FOUND = "FILE_NOT_FOUND"
    MISSING_METADATA = "MISSING_METADATA"
    INCOMPATIBLE_INPUT = "INCOMPATIBLE_INPUT"
    INCOMPATIBLE_CRS = "INCOMPATIBLE_CRS"
    INCOMPATIBLE_DIMENSIONS = "INCOMPATIBLE_DIMENSIONS"
    UNSUPPORTED_MODALITY = "UNSUPPORTED_MODALITY"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"
    ANALYSIS_FAILED = "ANALYSIS_FAILED"
    INVALID_REQUEST = "INVALID_REQUEST"
    NOT_FOUND = "NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class ErrorResponse(BaseModel):
    error: bool = True
    code: ErrorCode
    message: str


class Modality(str, Enum):
    OPTICAL = "optical"
    MULTISPECTRAL = "multispectral"
    SAR = "sar"
    UNKNOWN = "unknown"


class TaskType(str, Enum):
    SINGLE_IMAGE_VQA = "SINGLE_IMAGE_VQA"
    CAPTIONING = "CAPTIONING"
    REGION_GROUNDING = "REGION_GROUNDING"
    CHANGE_DETECTION = "CHANGE_DETECTION"
    OPTICAL_SAR_ANALYSIS = "OPTICAL_SAR_ANALYSIS"


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class GeoPoint(BaseModel):
    lat: float
    lon: float


class Detection(BaseModel):
    label: str
    confidence: float = Field(ge=0, le=1)
    bbox: list[float] = Field(description="[x1, y1, x2, y2] in pixel coordinates")
    area: float | None = None
    centroid: GeoPoint | None = None
