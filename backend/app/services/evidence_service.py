from typing import Dict, Any, List, Optional
from app.schemas.analysis import EvidenceItem


class EvidenceService:
    """
    Evidence Service responsible for validating, normalizing, and packaging
    intelligence evidence observations.

    In development mode, explicitly tags all evidence items with source='demo'
    and is_demo=True. In future production pipelines, this service will ingest
    and validate telemetry extracted from real SAR backscatter rasters and optical
    multispectral band reflectance arrays.
    """

    def create_evidence_item(
        self,
        item_id: str,
        label: str,
        category: str,
        layman_category: str,
        confidence: float,
        evidence_description: str,
        layman_explanation: str,
        layman_ground_type: str,
        bbox: List[float],
        coordinates: Dict[str, float],
        iou_score: Optional[float] = None,
        optical_reflection: Optional[Dict[str, Any]] = None,
        sar_backscatter: Optional[Dict[str, Any]] = None,
        dataset_id: Optional[str] = None,
        source: str = "demo",
        is_demo: bool = True
    ) -> EvidenceItem:
        return EvidenceItem(
            id=item_id,
            type="spatial_detection",
            label=label,
            category=category,
            layman_category=layman_category,
            confidence=round(confidence, 2),
            iou_score=round(iou_score, 2) if iou_score is not None else None,
            bbox=bbox,
            coordinates=coordinates,
            optical_reflection=optical_reflection,
            sar_backscatter=sar_backscatter,
            evidence_description=evidence_description,
            layman_explanation=layman_explanation,
            layman_ground_type=layman_ground_type,
            source=source,
            dataset=dataset_id,
            is_demo=is_demo
        )

    def validate_and_package(self, raw_items: List[Dict[str, Any]], dataset_id: str) -> List[EvidenceItem]:
        packaged: List[EvidenceItem] = []
        for raw in raw_items:
            # Enforce demo transparency flags
            packaged.append(
                EvidenceItem(
                    id=raw.get("id", f"ev-{len(packaged) + 1}"),
                    type=raw.get("type", "spatial_detection"),
                    label=raw.get("label", "Target Observation"),
                    category=raw.get("category", "anomaly"),
                    layman_category=raw.get("laymanCategory") or raw.get("layman_category", "Identified Feature"),
                    confidence=float(raw.get("confidence", 0.90)),
                    iou_score=float(raw.get("iouScore")) if raw.get("iouScore") is not None else raw.get("iou_score"),
                    bbox=raw.get("bbox", []),
                    coordinates=raw.get("coordinates", {}),
                    optical_reflection=raw.get("opticalReflection") or raw.get("optical_reflection"),
                    sar_backscatter=raw.get("sarBackscatter") or raw.get("sar_backscatter"),
                    evidence_description=raw.get("evidenceDescription") or raw.get("evidence_description", "Observable sensor response."),
                    layman_explanation=raw.get("laymanExplanation") or raw.get("layman_explanation", "Observed signature on satellite sensor."),
                    layman_ground_type=raw.get("laymanGroundType") or raw.get("layman_ground_type", "Ground Surface"),
                    source=raw.get("source", "demo"),
                    dataset=dataset_id,
                    is_demo=True
                )
            )
        return packaged


evidence_service = EvidenceService()
