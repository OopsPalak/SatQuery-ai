from __future__ import annotations

from fastapi import APIRouter, HTTPException, UploadFile

from app.config import get_settings
from app.geospatial.overlays import save_array_as_png
from app.geospatial.raster import read_raster_array
from app.schemas.common import ErrorCode
from app.schemas.upload import FileMetadata
from app.services import metadata_service
from app.services.file_validator import ValidationError, run_full_validation
from app.storage import file_storage

router = APIRouter(tags=["upload"])


def _generate_preview(file_id: str, path) -> str:
    settings = get_settings()
    try:
        array = read_raster_array(path, max_size=768)
        preview_path = settings.processed_path / f"{file_id}_preview.png"
        save_array_as_png(array, preview_path)
        return f"/processed/{preview_path.name}"
    except Exception:  # noqa: BLE001 - preview is best-effort, never blocks upload
        return f"/uploads/{path.name}"


@router.post("/api/upload", response_model=FileMetadata)
async def upload_file(file: UploadFile):
    raw_bytes = await file.read()
    try:
        validated = run_full_validation(file, raw_bytes)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail={"error": True, "code": exc.code.value, "message": exc.message}) from exc

    file_id, dest_path = file_storage.save_upload_bytes(raw_bytes, validated.safe_filename)
    thumbnail_url = _generate_preview(file_id, dest_path)

    try:
        meta = metadata_service.build_metadata(file_id, dest_path, validated.safe_filename, thumbnail_url)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=422,
            detail={"error": True, "code": ErrorCode.CORRUPTED_IMAGE.value, "message": f"Could not read image metadata: {exc}"},
        ) from exc

    file_storage.register_file(file_id, dest_path, meta.model_dump(mode="json", exclude={"path"}))
    return meta


@router.get("/api/upload/{file_id}/metadata", response_model=FileMetadata)
def get_metadata(file_id: str):
    record = file_storage.get_file_record(file_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.FILE_NOT_FOUND.value, "message": f"No file with id '{file_id}'."},
        )
    return FileMetadata(**{k: v for k, v in record.items() if k != "path"})
