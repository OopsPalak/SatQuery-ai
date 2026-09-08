from __future__ import annotations

import io
import os
import sys
from pathlib import Path

import pytest

# Ensure the backend root (parent of `app/`) is importable regardless of
# where pytest is invoked from.
BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("MOCK_INFERENCE", "true")
os.environ.setdefault("APP_ENV", "test")


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient
    from app.main import app

    return TestClient(app)


@pytest.fixture
def sample_png_bytes() -> bytes:
    from PIL import Image

    img = Image.new("RGB", (64, 64), color=(80, 120, 90))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
