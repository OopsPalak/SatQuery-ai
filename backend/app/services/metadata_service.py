"""Builds the structured metadata object returned by /api/upload and
/api/upload/{file_id}/metadata, and consumed internally by the agent.
"""
from __future__ import annotations

from pathlib import Path

from app.geospatial import metadata as geo_meta
from app.geospatial.raster import read_raster_info
from app.schemas.common import Modality
from app.schemas.upload import FileMetadata, ValidationInfo

_FORMAT_BY_EXT = {
    ".tif": "GeoTIFF",
    ".tiff": "GeoTIFF",
    ".png": "PNG",
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
}


def build_metadata(file_id: str, path: Path, original_filename: str, thumbnail_url: str) -> FileMetadata:
    info = read_raster_info(path)
    modality = geo_meta.detect_modality(original_filename, info)
    ext = path.suffix.lower()

    return FileMetadata(
        file_id=file_id,
        filename=original_filename,
        format=_FORMAT_BY_EXT.get(ext, "UNKNOWN"),
        width=info.width,
        height=info.height,
        bands=info.bands,
        crs=geo_meta.crs_label(info),
        resolution=geo_meta.resolution_label(info),
        acquisition_date=geo_meta.guess_acquisition_date(original_filename),
        modality=modality,
        region_hint=geo_meta.guess_region(original_filename),
        thumbnail_url=thumbnail_url,
        validation=ValidationInfo(valid=True, message="Input validated successfully"),
        path=str(path),
    )
