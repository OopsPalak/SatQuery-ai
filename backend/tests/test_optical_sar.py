from pathlib import Path

import numpy as np
from PIL import Image

from app.models import optical_sar
from app.geospatial.reprojection import crs_matches, dimensions_compatible


def _make_png(path: Path, color: tuple[int, int, int], size: int = 64) -> None:
    arr = np.full((size, size, 3), color, dtype="uint8")
    Image.fromarray(arr).save(path)


def test_analyze_optical_sar_returns_expected_shape(tmp_path):
    optical = tmp_path / "optical.png"
    sar = tmp_path / "sar.png"
    _make_png(optical, (150, 150, 150))
    _make_png(sar, (130, 130, 130))

    result = optical_sar.analyze_optical_sar(optical, sar, "What differences can you identify?")
    assert "answer" in result
    assert isinstance(result["optical_observations"], list)
    assert isinstance(result["sar_observations"], list)
    assert isinstance(result["fused_observations"], list)
    assert 0 <= result["confidence"] <= 1


def test_dimensions_compatible():
    assert dimensions_compatible((1000, 1000), (1010, 990)) is True
    assert dimensions_compatible((1000, 1000), (200, 200)) is False


def test_crs_matches_treats_unknown_as_compatible():
    assert crs_matches(None, "EPSG:4326") is True
    assert crs_matches("EPSG:4326", "EPSG:4326") is True
    assert crs_matches("EPSG:4326", "EPSG:32643") is False
