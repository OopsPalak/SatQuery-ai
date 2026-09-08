from pathlib import Path

import numpy as np
from PIL import Image

from app.models import change_detection as cd


def _make_png(path: Path, color: tuple[int, int, int], size: int = 64) -> None:
    arr = np.full((size, size, 3), color, dtype="uint8")
    Image.fromarray(arr).save(path)


def test_detect_change_identical_images(tmp_path):
    before = tmp_path / "before.png"
    after = tmp_path / "after.png"
    _make_png(before, (100, 100, 100))
    _make_png(after, (100, 100, 100))

    result = cd.detect_change(before, after)
    assert result["changed_area_percentage"] < 5


def test_detect_change_different_images(tmp_path):
    before = tmp_path / "before.png"
    after = tmp_path / "after.png"
    _make_png(before, (20, 20, 20))
    _make_png(after, (220, 220, 220))

    result = cd.detect_change(before, after)
    assert result["changed_area_percentage"] > 50


def test_summarize_returns_string(tmp_path):
    before = tmp_path / "before.png"
    after = tmp_path / "after.png"
    _make_png(before, (20, 20, 20))
    _make_png(after, (220, 220, 220))
    result = cd.detect_change(before, after)
    summary = cd.summarize(result)
    assert isinstance(summary, str) and len(summary) > 0
