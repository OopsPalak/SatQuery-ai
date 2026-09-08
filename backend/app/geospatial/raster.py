"""Raster reading utilities.

Real GeoTIFFs are read with rasterio/GDAL when those optional dependencies
are installed. When they are not (e.g. a lean CPU-only demo environment),
we fall back to Pillow for pixel dimensions and treat the scene as
non-georeferenced — the rest of the pipeline degrades gracefully rather
than crashing.
"""
from __future__ import annotations

import io
from dataclasses import dataclass, field
from pathlib import Path

try:
    import rasterio
    from rasterio.warp import transform_bounds

    HAS_RASTERIO = True
except Exception:  # noqa: BLE001 - rasterio/GDAL not installed
    HAS_RASTERIO = False

try:
    from PIL import Image

    HAS_PIL = True
except Exception:  # noqa: BLE001
    HAS_PIL = False


@dataclass
class RasterInfo:
    width: int
    height: int
    bands: int
    crs: str | None = None
    resolution: float | None = None  # meters/pixel, best-effort
    bounds: tuple[float, float, float, float] | None = None  # lon_min, lat_min, lon_max, lat_max
    dtype: str = "uint8"
    driver: str = "unknown"


def read_raster_info(path: Path) -> RasterInfo:
    if HAS_RASTERIO and path.suffix.lower() in {".tif", ".tiff"}:
        try:
            return _read_with_rasterio(path)
        except Exception:  # noqa: BLE001 - fall through to Pillow / raw fallback
            pass
    if HAS_PIL:
        try:
            return _read_with_pillow(path)
        except Exception:  # noqa: BLE001
            pass
    return RasterInfo(width=1024, height=1024, bands=3, driver="fallback")


def _read_with_rasterio(path: Path) -> RasterInfo:
    with rasterio.open(path) as src:
        crs_str = src.crs.to_string() if src.crs else None
        res = None
        if src.res:
            res = float((src.res[0] + src.res[1]) / 2)
        bounds = None
        if src.crs and src.bounds:
            try:
                bounds = transform_bounds(src.crs, "EPSG:4326", *src.bounds)
            except Exception:  # noqa: BLE001
                bounds = tuple(src.bounds)
        return RasterInfo(
            width=src.width,
            height=src.height,
            bands=src.count,
            crs=crs_str,
            resolution=res,
            bounds=bounds,
            dtype=str(src.dtypes[0]) if src.dtypes else "uint8",
            driver=src.driver or "GTiff",
        )


def _read_with_pillow(path: Path) -> RasterInfo:
    with Image.open(path) as img:
        bands = len(img.getbands())
        return RasterInfo(width=img.width, height=img.height, bands=bands, driver=img.format or "unknown")


def read_raster_array(path: Path, max_size: int = 512):
    """Return a small HxWxC numpy array (uint8) for downstream mock analysis
    (band statistics, difference maps, etc). Downsamples for speed."""
    import numpy as np

    if HAS_RASTERIO and path.suffix.lower() in {".tif", ".tiff"}:
        try:
            with rasterio.open(path) as src:
                scale = max(1, max(src.width, src.height) // max_size)
                out_shape = (src.count, max(1, src.height // scale), max(1, src.width // scale))
                arr = src.read(out_shape=out_shape)
                arr = np.transpose(arr, (1, 2, 0))
                return _to_uint8(arr)
        except Exception:  # noqa: BLE001
            pass
    if HAS_PIL:
        with Image.open(path) as img:
            img = img.convert("RGB")
            img.thumbnail((max_size, max_size))
            import numpy as np

            return np.array(img)
    import numpy as np

    return np.zeros((max_size, max_size, 3), dtype="uint8")


def _to_uint8(arr):
    import numpy as np

    arr = arr.astype("float32")
    lo, hi = float(arr.min()), float(arr.max())
    if hi - lo < 1e-6:
        return np.zeros(arr.shape, dtype="uint8")
    norm = (arr - lo) / (hi - lo)
    return (norm * 255).astype("uint8")
