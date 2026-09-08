"""Validates uploaded imagery before anything else touches it.

Checked, in order: extension allow-list, declared size, filename safety,
and — if Pillow can open it — basic image readability. GeoTIFFs that
Pillow can't decode fall back to a raw-bytes sanity check (rasterio, if
installed, is used later by the metadata service for the real read).
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass

from fastapi import UploadFile

from app.config import get_settings
from app.schemas.common import ErrorCode

ALLOWED_EXTENSIONS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_PREFIXES = ("image/", "application/octet-stream")

_SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


class ValidationError(Exception):
    def __init__(self, code: ErrorCode, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


@dataclass
class ValidatedUpload:
    safe_filename: str
    extension: str
    size_bytes: int


def sanitize_filename(filename: str) -> str:
    """Strip directory components and any character outside a safe allow-list,
    preventing path traversal or execution of unexpected file types."""
    base = os.path.basename(filename or "upload")
    base = _SAFE_NAME_RE.sub("_", base)
    return base or "upload"


def validate_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            ErrorCode.UNSUPPORTED_FILE,
            f"Unsupported file extension '{ext}'. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}.",
        )
    return ext


def validate_mime(content_type: str | None) -> None:
    if content_type and not any(content_type.startswith(p) for p in ALLOWED_MIME_PREFIXES):
        raise ValidationError(
            ErrorCode.UNSUPPORTED_FILE,
            f"Unsupported content type '{content_type}'.",
        )


def validate_size(size_bytes: int) -> None:
    settings = get_settings()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if size_bytes <= 0:
        raise ValidationError(ErrorCode.CORRUPTED_IMAGE, "Uploaded file is empty.")
    if size_bytes > max_bytes:
        raise ValidationError(
            ErrorCode.FILE_TOO_LARGE,
            f"File exceeds the {settings.max_upload_size_mb} MB upload limit.",
        )


def validate_file_count(count: int) -> None:
    settings = get_settings()
    if count == 0:
        raise ValidationError(ErrorCode.INVALID_REQUEST, "No files were provided.")
    if count > settings.max_files_per_upload:
        raise ValidationError(
            ErrorCode.TOO_MANY_FILES,
            f"At most {settings.max_files_per_upload} files may be uploaded at once.",
        )


def validate_readable_image(raw_bytes: bytes, extension: str) -> None:
    """Best-effort readability check. TIFF/GeoTIFF is allowed to pass through
    to the geospatial layer (rasterio) even if Pillow can't decode it, since
    many valid multi-band GeoTIFFs aren't standard Pillow-readable TIFFs."""
    if extension in {".png", ".jpg", ".jpeg"}:
        try:
            from PIL import Image
            import io

            with Image.open(io.BytesIO(raw_bytes)) as img:
                img.verify()
        except Exception as exc:  # noqa: BLE001
            raise ValidationError(ErrorCode.CORRUPTED_IMAGE, f"File could not be decoded as an image: {exc}") from exc


def run_full_validation(file: UploadFile, raw_bytes: bytes) -> ValidatedUpload:
    validate_mime(file.content_type)
    ext = validate_extension(file.filename or "")
    validate_size(len(raw_bytes))
    validate_readable_image(raw_bytes, ext)
    safe_name = sanitize_filename(file.filename or f"upload{ext}")
    return ValidatedUpload(safe_filename=safe_name, extension=ext, size_bytes=len(raw_bytes))
