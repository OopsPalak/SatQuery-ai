"""Manages the lifecycle of uploaded/sample files on disk, keyed by a
generated `file_id`. Metadata for each file is cached in-process (and
mirrored to a small JSON index on disk) so repeated /metadata lookups
don't need to re-read the raster.
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from threading import Lock
from typing import Any

from app.config import get_settings

_INDEX_LOCK = Lock()


def _index_path() -> Path:
    return get_settings().processed_path / "file_index.json"


def _load_index() -> dict[str, Any]:
    path = _index_path()
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except Exception:  # noqa: BLE001
        return {}


def _save_index(index: dict[str, Any]) -> None:
    path = _index_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with _INDEX_LOCK:
        path.write_text(json.dumps(index, indent=2, default=str))


def new_file_id() -> str:
    return f"file_{uuid.uuid4().hex[:12]}"


def save_upload_bytes(raw_bytes: bytes, safe_filename: str) -> tuple[str, Path]:
    settings = get_settings()
    file_id = new_file_id()
    dest = settings.upload_path / f"{file_id}_{safe_filename}"
    dest.write_bytes(raw_bytes)
    return file_id, dest


def register_file(file_id: str, path: Path, metadata: dict[str, Any]) -> None:
    index = _load_index()
    index[file_id] = {"path": str(path), **metadata}
    _save_index(index)


def get_file_record(file_id: str) -> dict[str, Any] | None:
    index = _load_index()
    return index.get(file_id)


def get_file_path(file_id: str) -> Path | None:
    record = get_file_record(file_id)
    if not record:
        return None
    path = Path(record["path"])
    return path if path.exists() else None


def list_files() -> dict[str, Any]:
    return _load_index()
