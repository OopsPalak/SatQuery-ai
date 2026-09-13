from typing import Optional, List, Dict, Any
from app.schemas.dataset import DatasetSummary, DatasetListResponse

# In-memory registry of dataset metadata records.
# NOTE: These represent metadata records for available satellite scenes / sensor passes,
# NOT raw satellite raster files. In a production deployment, this service will connect to
# STAC catalogs (SpatioTemporal Asset Catalog), Sentinel Hub, or ISRO Open Data APIs.

REGISTERED_DATASETS: List[Dict[str, Any]] = [
    {
        "id": "sentinel-1-demo",
        "name": "Sentinel-1 Radar (C-Band Synthetic Aperture Radar)",
        "sensor": "SAR",
        "type": "radar",
        "available": True,
        "region": "Global Orbit Coverage",
        "coordinates": "Variable Swath",
        "description": "All-weather day-and-night C-band synthetic aperture radar, penetrates dense cloud cover and precipitation.",
        "preset_queries": [
            "Are there ground deformation signals?",
            "Detect water bodies and surface inundation through clouds."
        ]
    },
    {
        "id": "sentinel-2-demo",
        "name": "Sentinel-2 Optical (Multispectral MSI)",
        "sensor": "Optical",
        "type": "optical",
        "available": True,
        "region": "Global Land Surface",
        "coordinates": "Variable Swath",
        "description": "High-resolution multispectral optical imagery covering 13 spectral bands for land cover and vegetation monitoring.",
        "preset_queries": [
            "Calculate normalized difference vegetation index (NDVI).",
            "Identify optical land cover classifications."
        ]
    },
    {
        "id": "ds-kaziranga-flood-2026",
        "name": "Assam Flood & Submerged Paddy Crop Analysis",
        "sensor": "Optical + SAR Multimodal",
        "type": "multimodal",
        "available": True,
        "region": "Kaziranga National Park & Brahmaputra Basin, Assam",
        "coordinates": "26.5775° N, 93.1711° E",
        "description": "Monsoon flood mapping over Assam farmlands comparing optical photo view with all-weather radar to pinpoint submerged crops.",
        "preset_queries": [
            "Where are the flooded agricultural fields and how deep is the water?",
            "Show me areas where clouds block the photo camera but radar can see clearly.",
            "Which crop fields are completely under water right now?",
            "Calculate the total flooded farmland area in acres."
        ]
    },
    {
        "id": "ds-mumbai-maritime-vessel-2026",
        "name": "Mumbai Offshore Harbor Ships & Cloud-Penetration",
        "sensor": "Optical + SAR Multimodal",
        "type": "multimodal",
        "available": True,
        "region": "Mumbai Port & Coastline, Maharashtra",
        "coordinates": "18.9400° N, 72.8500° E",
        "description": "Surveillance of cargo ships and ocean vessels in Mumbai harbor, demonstrating radar penetrating heavy monsoon cloud cover.",
        "preset_queries": [
            "Show me all cargo ships in the harbor even if hidden under thick clouds.",
            "Which ships are visible in both the regular photo and the radar view?",
            "Identify small fishing boats vs large container ships in the port.",
            "Are there any oil slick spills or smooth water damping patches?"
        ]
    },
    {
        "id": "ds-bengaluru-urban-2026",
        "name": "Bengaluru Building Sprawl & Wetland Lake Buffer",
        "sensor": "Optical + SAR Multimodal",
        "type": "multimodal",
        "available": True,
        "region": "Bengaluru Tech Corridor, Karnataka",
        "coordinates": "12.9716° N, 77.5946° E",
        "description": "Monitoring urban growth, high-rise office towers, and lake conservation zones in Bengaluru.",
        "preset_queries": [
            "Which tall concrete office buildings show strong radar reflections?",
            "Are there any new construction encroachments near the lake buffer?",
            "Show me green park areas versus concrete building clusters."
        ]
    },
    {
        "id": "ds-punjab-agriculture-2026",
        "name": "Punjab Wheat & Paddy Farm Health Monitoring",
        "sensor": "Optical + SAR Multimodal",
        "type": "multimodal",
        "available": True,
        "region": "Ludhiana Agricultural Belt, Punjab",
        "coordinates": "30.9010° N, 75.8573° E",
        "description": "Evaluating farm crop health, plant growth density, and soil moisture levels in Punjab.",
        "preset_queries": [
            "Which crop fields have healthy green plant growth right now?",
            "Show me farm plots with high soil moisture levels.",
            "Where are the irrigation canals located across the fields?"
        ]
    },
    {
        "id": "ds-himalayas-landslide-2026",
        "name": "Himalayan Mountain Landslide & Debris Safety",
        "sensor": "Optical + SAR Multimodal",
        "type": "multimodal",
        "available": True,
        "region": "Uttarkashi Highway Corridor, Uttarakhand",
        "coordinates": "30.7268° N, 78.4354° E",
        "description": "Detecting mountain slope soil slides and loose rock debris near mountain transit highways.",
        "preset_queries": [
            "Where is the active landslide scarp with loose falling soil?",
            "Are mountain highway roads at risk from sliding rock debris?",
            "Show me stable forested slopes versus bare sliding dirt."
        ]
    }
]


class DatasetService:
    def __init__(self, datasets: Optional[List[Dict[str, Any]]] = None):
        self._datasets = datasets or REGISTERED_DATASETS

    def list_datasets(self) -> DatasetListResponse:
        summaries = [
            DatasetSummary(
                id=ds["id"],
                name=ds["name"],
                sensor=ds["sensor"],
                type=ds["type"],
                available=ds["available"],
                region=ds.get("region"),
                coordinates=ds.get("coordinates"),
                description=ds.get("description"),
                preset_queries=ds.get("preset_queries"),
            )
            for ds in self._datasets
        ]
        return DatasetListResponse(datasets=summaries)

    def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        for ds in self._datasets:
            if ds["id"] == dataset_id:
                return ds
        return None


# Global singleton instance for easy dependency injection
dataset_service = DatasetService()
