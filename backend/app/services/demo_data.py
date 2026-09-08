"""Demo Mode support.

Ensures data/samples/ contains a small set of usable "satellite" images so
POST /api/demo/load always works — even with no GPU, no real imagery, and
no network access. If the samples directory is empty, synthesizes a
handful of deterministic procedural PNGs that stand in for real scenes
(consistent colors/patterns per region so the mock VLM's narratives line
up with what's on screen).

Real acquired sample GeoTIFFs can simply be dropped into data/samples/ to
replace these — anything already present is used as-is and never
overwritten.
"""
from __future__ import annotations

from pathlib import Path

from app.config import get_settings

_REGIONS = [
    {"name": "urban_corridor", "base": (70, 75, 82), "accent": (150, 150, 140), "modality_hint": ""},
    {"name": "agricultural_belt", "base": (90, 110, 60), "accent": (150, 170, 90), "modality_hint": ""},
    {"name": "river_basin", "base": (40, 90, 120), "accent": (60, 130, 100), "modality_hint": ""},
    {"name": "coastal_zone_sar", "base": (60, 60, 65), "accent": (110, 110, 115), "modality_hint": "sar"},
    {"name": "forest_reserve", "base": (30, 70, 40), "accent": (50, 100, 55), "modality_hint": ""},
]


def _synthesize(path: Path, base: tuple[int, int, int], accent: tuple[int, int, int], size: int = 512) -> None:
    import numpy as np
    from PIL import Image

    rng = np.random.default_rng(abs(hash(path.name)) % (2**32))
    arr = np.zeros((size, size, 3), dtype="uint8")
    for c in range(3):
        arr[..., c] = base[c]

    # Add a few blocky "structures" tinted toward the accent color so the
    # mock evidence overlays have something plausible to point at.
    for _ in range(6):
        h, w = rng.integers(40, 140), rng.integers(40, 140)
        y, x = rng.integers(0, size - h), rng.integers(0, size - w)
        for c in range(3):
            arr[y : y + h, x : x + w, c] = accent[c]

    noise = rng.integers(-10, 10, size=(size, size, 3))
    arr = np.clip(arr.astype(int) + noise, 0, 255).astype("uint8")
    Image.fromarray(arr).save(path)


def ensure_sample_files() -> list[Path]:
    settings = get_settings()
    settings.sample_path.mkdir(parents=True, exist_ok=True)
    paths = []
    for region in _REGIONS:
        fname = f"{region['name']}.png"
        path = settings.sample_path / fname
        if not path.exists():
            _synthesize(path, region["base"], region["accent"])
        paths.append(path)
    return paths
