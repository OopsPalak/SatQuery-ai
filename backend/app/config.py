"""
Central configuration for the SatQuery AI backend.

Everything that varies between environments (paths, CORS origins, whether to
run in deterministic mock-inference mode, etc.) lives here and is loaded from
environment variables / a .env file. No secrets or API keys are hard-coded.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict

    _PYDANTIC_V2 = True
except ImportError:  # pydantic v1 fallback
    from pydantic import BaseSettings  # type: ignore

    _PYDANTIC_V2 = False

# Backend project root (the `backend/` directory), independent of cwd.
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "SatQuery AI"
    app_version: str = "1.0.0"

    host: str = "0.0.0.0"
    port: int = 8000

    model_device: str = "cpu"
    mock_inference: bool = True

    upload_dir: str = "data/uploads"
    processed_dir: str = "data/processed"
    result_dir: str = "data/results"
    sample_dir: str = "data/samples"
    checkpoint_dir: str = "models"

    frontend_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    history_db_path: str = "data/history.db"

    max_upload_size_mb: int = 200
    max_files_per_upload: int = 4

    vlm_checkpoint_path: str = ""

    if _PYDANTIC_V2:
        model_config = SettingsConfigDict(env_file=".env", extra="ignore", protected_namespaces=())
    else:  # pragma: no cover - legacy pydantic v1 path

        class Config:
            env_file = ".env"
            extra = "ignore"

    # -- derived helpers -----------------------------------------------
    @property
    def cors_origins(self) -> List[str]:
        origins = {o.strip() for o in self.allowed_origins.split(",") if o.strip()}
        origins.add(self.frontend_url)
        return sorted(origins)

    def _abs(self, relative: str) -> Path:
        p = Path(relative)
        return p if p.is_absolute() else (BASE_DIR / p)

    @property
    def upload_path(self) -> Path:
        return self._abs(self.upload_dir)

    @property
    def processed_path(self) -> Path:
        return self._abs(self.processed_dir)

    @property
    def result_path(self) -> Path:
        return self._abs(self.result_dir)

    @property
    def sample_path(self) -> Path:
        return self._abs(self.sample_dir)

    @property
    def checkpoint_path(self) -> Path:
        return self._abs(self.checkpoint_dir)

    @property
    def history_db_full_path(self) -> Path:
        return self._abs(self.history_db_path)

    def ensure_directories(self) -> None:
        for p in (self.upload_path, self.processed_path, self.result_path, self.sample_path, self.checkpoint_path):
            p.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_directories()
    return settings
