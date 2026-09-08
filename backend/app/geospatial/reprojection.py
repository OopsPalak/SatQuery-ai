"""Reprojection helpers for aligning two rasters onto a common CRS/grid.

When rasterio/GDAL are unavailable, `reproject_to_match` becomes a no-op
that simply returns the input array — acceptable for the mock/demo
pipeline, but real change-detection/fusion accuracy depends on this being
backed by rasterio in a full deployment.
"""
from __future__ import annotations

from pathlib import Path

try:
    import rasterio
    from rasterio.warp import calculate_default_transform, reproject, Resampling

    HAS_RASTERIO = True
except Exception:  # noqa: BLE001
    HAS_RASTERIO = False


def crs_matches(crs_a: str | None, crs_b: str | None) -> bool:
    if not crs_a or not crs_b:
        # Unknown CRS on either side — treat as compatible for the demo
        # pipeline rather than blocking the user.
        return True
    return crs_a.strip().upper() == crs_b.strip().upper()


def dimensions_compatible(dims_a: tuple[int, int], dims_b: tuple[int, int], tolerance: float = 0.15) -> bool:
    wa, ha = dims_a
    wb, hb = dims_b
    if min(wa, ha, wb, hb) == 0:
        return False
    ratio_w = abs(wa - wb) / max(wa, wb)
    ratio_h = abs(ha - hb) / max(ha, hb)
    return ratio_w <= tolerance and ratio_h <= tolerance


def reproject_to_match(source_path: Path, target_crs: str, out_path: Path) -> Path:
    """Reproject `source_path` into `target_crs`, writing to `out_path`.
    No-op copy when rasterio is unavailable."""
    if not HAS_RASTERIO:
        out_path.write_bytes(source_path.read_bytes())
        return out_path

    with rasterio.open(source_path) as src:
        transform, width, height = calculate_default_transform(src.crs, target_crs, src.width, src.height, *src.bounds)
        kwargs = src.meta.copy()
        kwargs.update({"crs": target_crs, "transform": transform, "width": width, "height": height})

        with rasterio.open(out_path, "w", **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=target_crs,
                    resampling=Resampling.bilinear,
                )
    return out_path
