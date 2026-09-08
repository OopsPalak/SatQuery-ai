"""Optical + SAR cross-modal analysis.

The baseline here reads simple per-modality statistics (optical brightness/
texture as a proxy for land-cover, SAR backscatter intensity as a proxy for
surface roughness/built-up persistence) and combines them into a templated
fused interpretation. `analyze_optical_sar()` is the seam for plugging in a
real multimodal fusion model later.
"""
from __future__ import annotations

from pathlib import Path

from app.geospatial.alignment import align_arrays
from app.geospatial.raster import read_raster_array


def analyze_optical_sar(optical_path: Path, sar_path: Path, query: str) -> dict:
    import numpy as np

    optical = read_raster_array(optical_path)
    sar = read_raster_array(sar_path)
    optical, sar = align_arrays(optical, sar)

    optical_brightness = float(optical.astype("float32").mean())
    sar_intensity = float(sar.astype("float32").mean())
    sar_texture = float(np.std(sar.astype("float32")))

    optical_observations = []
    sar_observations = []
    fused_observations = []

    if optical_brightness > 140:
        optical_observations.append("High reflectance consistent with built-up or bare-soil surfaces.")
    elif optical_brightness > 90:
        optical_observations.append("Moderate reflectance consistent with mixed vegetation and built-up cover.")
    else:
        optical_observations.append("Low reflectance consistent with dense vegetation or water.")

    if sar_intensity > 120 and sar_texture > 35:
        sar_observations.append("Strong, heterogeneous backscatter consistent with dense built-up structures.")
        fused_observations.append("Optical and SAR agree on the presence of persistent built-up surfaces.")
    elif sar_intensity > 80:
        sar_observations.append("Moderate backscatter consistent with mixed vegetation/built surfaces.")
        fused_observations.append("Cross-modal signatures suggest a heterogeneous land-cover mix.")
    else:
        sar_observations.append("Low, smooth backscatter consistent with water or flat bare ground.")
        fused_observations.append("Optical and SAR jointly support the presence of a smooth, low-relief surface (likely water or bare ground).")

    answer = (
        "Optical imagery indicates "
        + optical_observations[0].split("consistent with", 1)[1].strip().rstrip(".")
        + ", while SAR backscatter "
        + ("confirms" if fused_observations and "agree" in fused_observations[0] else "adds context on")
        + " the surface structure. "
        + fused_observations[0]
    )

    confidence = round(min(0.95, max(0.6, 0.75 + (sar_texture / 500))), 2)

    return {
        "answer": answer,
        "optical_observations": optical_observations,
        "sar_observations": sar_observations,
        "fused_observations": fused_observations,
        "confidence": confidence,
        "optical_array": optical,
        "sar_array": sar,
    }
