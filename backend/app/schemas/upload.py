"""Schemas for the upload + metadata endpoints."""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import Modality


class ValidationInfo(BaseModel):
    valid: bool
    message: str


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    format: str
    width: int
    height: int
    bands: int
    crs: str | None = None
    resolution: str | None = None
    acquisition_date: str | None = None
    modality: Modality
    region_hint: str | None = Field(
        default=None, description="Heuristic scene category (urban/agricultural/water/coastal/forest) for demo purposes"
    )
    thumbnail_url: str
    validation: ValidationInfo


class FileMetadata(UploadResponse):
    """Metadata endpoint returns the same shape as the upload response."""

    path: str | None = Field(default=None, exclude=True)
