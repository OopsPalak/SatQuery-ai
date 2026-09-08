from __future__ import annotations

from fastapi import APIRouter

from app.geospatial.overlays import save_array_as_png
from app.geospatial.raster import read_raster_array
from app.schemas.analysis import DemoLoadResponse
from app.services import metadata_service
from app.services.demo_data import ensure_sample_files
from app.storage import file_storage
from app.config import get_settings

router = APIRouter(tags=["demo"])


@router.post("/api/demo/load", response_model=DemoLoadResponse)
def load_demo():
    settings = get_settings()
    sample_paths = ensure_sample_files()

    scenes = []
    for path in sample_paths:
        file_id, dest_path = _register_sample(path)
        try:
            array = read_raster_array(dest_path, max_size=512)
            preview_path = settings.processed_path / f"{file_id}_preview.png"
            save_array_as_png(array, preview_path)
            thumbnail_url = f"/processed/{preview_path.name}"
        except Exception:  # noqa: BLE001
            thumbnail_url = f"/uploads/{dest_path.name}"

        meta = metadata_service.build_metadata(file_id, dest_path, path.name, thumbnail_url)
        file_storage.register_file(file_id, dest_path, meta.model_dump(mode="json", exclude={"path"}))
        scenes.append(meta)

    return DemoLoadResponse(
        scenes=scenes,
        suggested_query="Highlight the water body.",
        suggested_mode="grounding",
    )


def _register_sample(sample_path):
    """Copy a sample file into the upload space under a fresh file_id so it
    behaves identically to a user upload for the rest of the pipeline."""
    raw = sample_path.read_bytes()
    return file_storage.save_upload_bytes(raw, sample_path.name)
