"""Higher-level metadata helpers built on top of app.geospatial.raster.

Includes lightweight heuristics used by the demo/mock pipeline: modality
detection from filename/band-count, and a coarse "region" guess (urban /
agricultural / water / coastal / forest) used only to pick a plausible mock
narrative when no trained model is available.
"""
from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path

from app.geospatial.raster import RasterInfo
from app.schemas.common import Modality

_DATE_RE = re.compile(r"(20\d{2})[-_]?(\d{2})[-_]?(\d{2})")


def detect_modality(filename: str, info: RasterInfo) -> Modality:
    name = filename.lower()
    if "sar" in name or "s1" in name or "sentinel-1" in name:
        return Modality.SAR
    if "multispectral" in name or "msi" in name or info.bands >= 4:
        return Modality.MULTISPECTRAL
    if info.bands == 1:
        return Modality.SAR  # single-band radar backscatter is the common case
    return Modality.OPTICAL


def guess_acquisition_date(filename: str) -> str | None:
    match = _DATE_RE.search(filename)
    if not match:
        return None
    year, month, day = match.groups()
    try:
        return datetime(int(year), int(month), int(day)).date().isoformat()
    except ValueError:
        return None


def guess_region(filename: str) -> str:
    name = filename.lower()
    for key in ("urban", "agri", "water", "river", "coast", "forest"):
        if key in name:
            return {
                "urban": "urban",
                "agri": "agricultural",
                "water": "water",
                "river": "water",
                "coast": "coastal",
                "forest": "forest",
            }[key]
    return "urban"


def sensor_label(modality: Modality) -> str:
    return {
        Modality.OPTICAL: "Sentinel-2 MSI (Optical)",
        Modality.MULTISPECTRAL: "Sentinel-2 MSI",
        Modality.SAR: "Sentinel-1 SAR",
        Modality.UNKNOWN: "Unknown sensor",
    }[modality]


def resolution_label(info: RasterInfo) -> str:
    if info.resolution:
        return f"{info.resolution:.1f} m/px"
    return "10.0 m/px (assumed)"


def crs_label(info: RasterInfo) -> str:
    return info.crs or "EPSG:4326 (assumed)"
