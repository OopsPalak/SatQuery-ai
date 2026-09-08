"""Bi-temporal change detection.

`detect_change()` is the seam: the current implementation is a classical
image-difference baseline (align the two rasters, threshold the absolute
difference, summarize by class-like heuristics). A trained change-
detection model (see app/models/vlm.py's HF-backend pattern) can replace
the body of this function without touching callers.
"""
from __future__ import annotations

from pathlib import Path

from app.geospatial.alignment import align_arrays
from app.geospatial.raster import read_raster_array


def detect_change(before_path: Path, after_path: Path) -> dict:
    import numpy as np

    before = read_raster_array(before_path)
    after = read_raster_array(after_path)
    before, after = align_arrays(before, after)

    diff = np.abs(before.astype("float32") - after.astype("float32"))
    if diff.ndim == 3:
        diff = diff.mean(axis=2)

    # Absolute intensity-difference threshold (0-255 scale). A percentile-based
    # threshold was tried first but breaks down for near-uniform scenes (real
    # or synthetic) where every pixel changes by roughly the same amount —
    # the percentile itself becomes the max diff and nothing clears it. A
    # fixed threshold, with an inclusive comparison, avoids that edge case
    # while still being a reasonable "did this pixel meaningfully change"
    # cutoff for demo purposes.
    threshold = 15.0
    changed_mask = diff >= threshold
    changed_area_pct = float(changed_mask.mean() * 100)

    # Heuristic class-level deltas derived from mean brightness shifts per
    # channel — a stand-in for a real land-cover classifier run on both
    # dates. Bounded to plausible ranges for demo stability.
    if before.ndim == 3 and after.ndim == 3 and before.shape[2] >= 3:
        brightness_before = before[..., :3].mean()
        brightness_after = after[..., :3].mean()
        brightness_delta = float(brightness_after - brightness_before)
    else:
        brightness_delta = 0.0

    built_up_delta = round(max(-25.0, min(25.0, changed_area_pct * 0.6 + brightness_delta * 0.1)), 1)
    vegetation_delta = round(max(-25.0, min(25.0, -changed_area_pct * 0.3 - brightness_delta * 0.05)), 1)
    water_delta = round(max(-10.0, min(10.0, brightness_delta * 0.05)), 1)

    return {
        "changed_area_percentage": round(changed_area_pct, 2),
        "built_up_delta_pct": built_up_delta,
        "vegetation_delta_pct": vegetation_delta,
        "water_delta_pct": water_delta,
        "before_array": before,
        "after_array": after,
        "diff_array": diff,
        "confidence": round(min(0.97, max(0.55, 0.9 - abs(changed_area_pct - 15) / 100)), 2),
    }


def summarize(result: dict) -> str:
    pct = result["changed_area_percentage"]
    built = result["built_up_delta_pct"]
    if built > 5:
        return (
            f"Significant expansion of built-up regions is detected, with roughly {pct:.1f}% of the scene showing "
            "notable change between the two dates."
        )
    if built < -5:
        return f"A net reduction in built-up extent is detected, alongside {pct:.1f}% of the scene showing change overall."
    if pct > 20:
        return f"Widespread change is detected across {pct:.1f}% of the scene, without a dominant single land-cover trend."
    return f"Change is limited: approximately {pct:.1f}% of the scene shows measurable difference between the two dates."
