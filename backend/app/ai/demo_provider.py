from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from app.ai.base_provider import AnalysisProvider
from app.schemas.analysis import (
    AnalysisResponse,
    ConfidenceInfo,
    EvidenceItem,
    AuditStep,
    AnalyticalMetrics,
    RegionInput,
)
from app.services.evidence_service import evidence_service


class DemoAnalysisProvider(AnalysisProvider):
    """
    Development/Mock analysis provider.

    IMPORTANT ARCHITECTURAL NOTICE:
    This provider does NOT claim to run actual remote sensing AI models or live satellite
    image downloading. It produces deterministic, scientifically structured development
    telemetry and grounded evidence for pair-testing with the SatQuery frontend.

    It demonstrates:
    1. Evidence-gated decision making (returning 'insufficient_evidence' rather than hallucinating).
    2. Physical radar microwave backscatter (dB) and optical spectral indices (NDWI, NDVI).
    3. Reproducible 5-stage auditable analysis trail.
    4. Explicit 'demo' provenance tags on all evidence and confidence scores.
    """

    async def analyze(
        self,
        question: str,
        dataset: Dict[str, Any],
        region: Optional[RegionInput] = None
    ) -> AnalysisResponse:
        q_lower = question.lower().strip()
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        dataset_id = dataset.get("id", "unknown-dataset")
        dataset_name = dataset.get("name", "Satellite Dataset")
        region_str = dataset.get("region") or (region.name if region and region.name else "Target Area")

        # 1. Check for Insufficient Evidence / Out-of-Domain Conditions
        # SatQuery AI is evidence-gated. If the scene lacks signatures or the query
        # asks for unobserved phenomena, we return an insufficient_evidence state.
        out_of_domain_keywords = [
            "nuclear", "underground", "volcano", "tsunami", "alien", "submarine",
            "gold mine", "traffic jam", "car license", "indoor"
        ]
        is_explicitly_unsupported = any(kw in q_lower for kw in out_of_domain_keywords)

        # Cross-check dataset context vs query subject
        is_landslide_query = any(k in q_lower for k in ["landslide", "debris", "slope", "scarp", "sliding", "soil slide"])
        is_maritime_query = any(k in q_lower for k in ["ship", "vessel", "boat", "maritime", "cargo", "tanker", "harbor"])
        is_flood_query = any(k in q_lower for k in ["flood", "inundat", "submerge", "water level", "paddy crop", "overflow"])
        is_urban_query = any(k in q_lower for k in ["building", "urban", "concrete", "tower", "office", "lake buffer", "encroach"])
        is_agri_query = any(k in q_lower for k in ["crop", "farm", "agriculture", "wheat", "vegetation", "plant health", "soil moisture"])

        # Check for mismatch between dataset and question
        is_landslide_dataset = "landslide" in dataset_id or "himalayas" in dataset_id
        is_maritime_dataset = "vessel" in dataset_id or "mumbai" in dataset_id
        is_flood_dataset = "flood" in dataset_id or "kaziranga" in dataset_id
        is_urban_dataset = "urban" in dataset_id or "bengaluru" in dataset_id
        is_agri_dataset = "agri" in dataset_id or "punjab" in dataset_id

        mismatch = False
        if is_landslide_query and not (is_landslide_dataset or dataset_id.startswith("sentinel")):
            mismatch = True
        elif is_maritime_query and not (is_maritime_dataset or dataset_id.startswith("sentinel")):
            mismatch = True
        elif is_flood_query and not (is_flood_dataset or is_urban_dataset or dataset_id.startswith("sentinel")):
            mismatch = True
        elif is_urban_query and not (is_urban_dataset or dataset_id.startswith("sentinel")):
            mismatch = True
        elif is_agri_query and not (is_agri_dataset or is_flood_dataset or dataset_id.startswith("sentinel")):
            mismatch = True

        if is_explicitly_unsupported or mismatch:
            return self._build_insufficient_evidence_response(
                question=question,
                dataset=dataset,
                reason="No corresponding sensor evidence or spatial backscatter signatures match the requested query within this satellite dataset coverage.",
                timestamp=timestamp
            )

        # 2. Match Target Scenario Evidence
        evidence_items: List[EvidenceItem] = []

        if is_landslide_query or is_landslide_dataset:
            evidence_items.append(
                evidence_service.create_evidence_item(
                    item_id="det-slide-01",
                    label="Active Mountain Landslide Slope",
                    category="landslide",
                    layman_category="Unstable Landslide Area",
                    confidence=0.93,
                    iou_score=0.88,
                    bbox=[38.0, 30.0, 26.0, 32.0],
                    coordinates={"lat": 30.735, "lon": 78.442},
                    optical_reflection={"rgb": "#6e5843", "nirValue": 0.19, "ndvi": 0.08, "ndwi": -0.15},
                    sar_backscatter={"vv_dB": -14.2, "vh_dB": -21.0, "ratio_dB": 6.8, "coherence": 0.05},
                    evidence_description="Loss of radar interferometric phase stability (0.05 coherence) confirms active ground soil displacement along steep scarp.",
                    layman_explanation="Radar pulse decorrelation confirms loose dirt and rocks are actively sliding down this steep mountain slope.",
                    layman_ground_type="Active Landslide Dirt Scarp",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                )
            )
            answer_text = (
                f"[DEVELOPMENT DEMO] SatQuery AI Analysis: Outlined {len(evidence_items)} active landslide scarp in {region_str}. "
                f"Sentinel-1 radar phase coherence dropped to 0.05, indicating ongoing mass soil displacement threatening the highway transit corridor."
            )

        elif is_maritime_query or is_maritime_dataset:
            evidence_items.extend([
                evidence_service.create_evidence_item(
                    item_id="det-vessel-01",
                    label="Large Container Cargo Ship (240m)",
                    category="vessel",
                    layman_category="Cargo Container Ship",
                    confidence=0.97,
                    iou_score=0.94,
                    bbox=[62.0, 38.0, 8.0, 12.0],
                    coordinates={"lat": 18.925, "lon": 72.842},
                    optical_reflection={"rgb": "#e76f51", "nirValue": 0.42, "ndvi": 0.12, "ndwi": -0.32},
                    sar_backscatter={"vv_dB": 24.6, "vh_dB": 16.2, "ratio_dB": 8.4, "coherence": 0.92},
                    evidence_description="Metallic dihedral corner reflections from vertical steel hull walls yield high backscatter (+24.6 dB).",
                    layman_explanation="Vertical steel walls of this container ship bounced radar radio waves straight back to space, creating a bright echo.",
                    layman_ground_type="Steel Container Ship Hull",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                ),
                evidence_service.create_evidence_item(
                    item_id="det-vessel-02",
                    label="Cloud-Covered Patrol Boat",
                    category="vessel",
                    layman_category="Ship Under Cloud Cover",
                    confidence=0.94,
                    iou_score=0.89,
                    bbox=[68.0, 25.0, 7.0, 10.0],
                    coordinates={"lat": 18.960, "lon": 72.865},
                    optical_reflection={"rgb": "#ffffff", "nirValue": 0.85, "ndvi": 0.0, "ndwi": 0.0},
                    sar_backscatter={"vv_dB": 21.4, "vh_dB": 14.1, "ratio_dB": 7.3, "coherence": 0.88},
                    evidence_description="Target completely obscured by optical cloud cover (albedo 0.85); radar penetrates cloud layer with +21.4 dB bounce.",
                    layman_explanation="Thick monsoon clouds block standard cameras, but all-weather radar pulses penetrate clouds to reveal the boat.",
                    layman_ground_type="Coastal Patrol Boat (Cloud-Obscured)",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                )
            ])
            answer_text = (
                f"[DEVELOPMENT DEMO] SatQuery AI Analysis: Identified {len(evidence_items)} maritime vessels in {region_str}. "
                f"Synthetic Aperture Radar (SAR) pierced through monsoon cloud cover to detect metallic hull structures with high confidence."
            )

        elif is_flood_query or is_flood_dataset:
            evidence_items.extend([
                evidence_service.create_evidence_item(
                    item_id="det-flood-01",
                    label="Submerged Rice Paddy Field A",
                    category="flood_inundation",
                    layman_category="Flooded Farmland",
                    confidence=0.96,
                    iou_score=0.91,
                    bbox=[18.0, 52.0, 18.0, 15.0],
                    coordinates={"lat": 26.542, "lon": 93.125},
                    optical_reflection={"rgb": "#1d352b", "nirValue": 0.12, "ndvi": -0.15, "ndwi": 0.68},
                    sar_backscatter={"vv_dB": -22.4, "vh_dB": -28.1, "ratio_dB": 5.7, "coherence": 0.14},
                    evidence_description="Specular radar microwave reflection away from flat water surface creates dark absorption patch (-22.4 dB). NDWI is +0.68.",
                    layman_explanation="Smooth standing flood water acted like a mirror, bouncing radar signals away into space and confirming inundated farmland.",
                    layman_ground_type="Flooded Rice Field (Standing Water)",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                ),
                evidence_service.create_evidence_item(
                    item_id="det-flood-02",
                    label="Brahmaputra River Overspill Basin",
                    category="flood_inundation",
                    layman_category="River Overflow Zone",
                    confidence=0.98,
                    iou_score=0.95,
                    bbox=[45.0, 63.0, 22.0, 18.0],
                    coordinates={"lat": 26.581, "lon": 93.210},
                    optical_reflection={"rgb": "#142631", "nirValue": 0.08, "ndvi": -0.28, "ndwi": 0.82},
                    sar_backscatter={"vv_dB": -24.8, "vh_dB": -30.5, "ratio_dB": 5.7, "coherence": 0.08},
                    evidence_description="Main river channel breach overflowing into low-lying plains with high water index (+0.82) and low backscatter.",
                    layman_explanation="Natural river embankments breached, submerging adjacent low-lying terrain under deep flood waters.",
                    layman_ground_type="Overflowing River Stream",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                )
            ])
            answer_text = (
                f"[DEVELOPMENT DEMO] SatQuery AI Analysis: Outlined {len(evidence_items)} flooded agricultural sectors across {region_str}. "
                f"Standing water mirror scattering isolates submerged paddy fields with calibrated precision."
            )

        elif is_urban_query or is_urban_dataset:
            evidence_items.append(
                evidence_service.create_evidence_item(
                    item_id="det-urban-01",
                    label="Tech Park Office High-Rise Cluster",
                    category="building_structure",
                    layman_category="Tall Office Building",
                    confidence=0.95,
                    iou_score=0.92,
                    bbox=[56.0, 13.0, 14.0, 23.0],
                    coordinates={"lat": 12.985, "lon": 77.630},
                    optical_reflection={"rgb": "#8395a7", "nirValue": 0.22, "ndvi": 0.10, "ndwi": -0.45},
                    sar_backscatter={"vv_dB": 18.5, "vh_dB": 11.2, "ratio_dB": 7.3, "coherence": 0.89},
                    evidence_description="Vertical concrete walls create intense double-bounce radar echo (+18.5 dB) distinct from surrounding ground.",
                    layman_explanation="Tall concrete office building walls bounce radar signals straight back, creating sharp geometric structural outlines.",
                    layman_ground_type="Concrete High-Rise Commercial Building",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                )
            )
            answer_text = (
                f"[DEVELOPMENT DEMO] SatQuery AI Analysis: Located {len(evidence_items)} building clusters in {region_str}. "
                f"Double-bounce radar returns isolate concrete building geometries."
            )

        elif is_agri_query or is_agri_dataset:
            evidence_items.append(
                evidence_service.create_evidence_item(
                    item_id="det-agri-01",
                    label="Healthy Green Wheat Field Plot 4B",
                    category="vegetation_loss",
                    layman_category="Healthy Green Crop",
                    confidence=0.94,
                    iou_score=0.90,
                    bbox=[41.0, 4.0, 28.0, 22.0],
                    coordinates={"lat": 30.920, "lon": 75.820},
                    optical_reflection={"rgb": "#5fa453", "nirValue": 0.78, "ndvi": 0.76, "ndwi": -0.52},
                    sar_backscatter={"vv_dB": -11.2, "vh_dB": -16.8, "ratio_dB": 5.6, "coherence": 0.65},
                    evidence_description="Elevated near-infrared chlorophyll reflection (NDVI +0.76) combined with volume radar scattering from crop stems.",
                    layman_explanation="Strong infrared reflection verifies vigorous chlorophyll growth and dense crop stems in this wheat plot.",
                    layman_ground_type="Dense Wheat Farm Crop",
                    dataset_id=dataset_id,
                    source="demo",
                    is_demo=True
                )
            )
            answer_text = (
                f"[DEVELOPMENT DEMO] SatQuery AI Analysis: Scanned agricultural plots in {region_str}. "
                f"Identified {len(evidence_items)} active crop parcels exhibiting healthy biomass vegetation indices."
            )

        else:
            # Fallback for generic demo inquiries
            return self._build_insufficient_evidence_response(
                question=question,
                dataset=dataset,
                reason=f"Insufficient evidence in '{dataset_name}' to resolve '{question}'. No corresponding spectral or radar features detected.",
                timestamp=timestamp
            )

        # 3. Compute Demo Confidence Metrics
        avg_confidence = sum(e.confidence for e in evidence_items) / (len(evidence_items) or 1)
        conf_score = round(avg_confidence, 2)
        conf_label = "high" if conf_score >= 0.85 else "medium" if conf_score >= 0.60 else "low"

        # 4. Construct 5-Stage Audit Trail
        audit_trail = self._build_audit_trail(question, dataset, region_str, len(evidence_items), conf_score, timestamp)

        # 5. Diagnostic Telemetry Metrics
        analytical_metrics = AnalyticalMetrics(
            signal_to_noise_ratio="19.4 dB",
            spatial_uncertainty="± 2.0 meters (Demo Calibrated)",
            optical_cloud_cover="35% Cloud Obscuration (Pierced by Radar)" if is_maritime_query else "12% Minor Clouds",
            sar_backscatter_std_dev="3.1 dB",
            model_latency_ms=315,
            cross_attention_score=0.945,
            layman_cloud_cover_text="Radar microwaves penetrated cloud cover for 100% ground visibility.",
            layman_accuracy_text="High precision geolocation (±2m)."
        )

        return AnalysisResponse(
            answer=answer_text,
            confidence=ConfidenceInfo(
                score=conf_score,
                label=conf_label,
                source="demo"
            ),
            confidence_label=conf_label,
            targets_found=len(evidence_items),
            targets=evidence_items,
            evidence=evidence_items,
            dataset={
                "id": dataset_id,
                "name": dataset_name,
                "region": region_str,
                "sensor": dataset.get("sensor", "Multimodal SAR/Optical")
            },
            audit_trail=audit_trail,
            status="success",
            analytical_metrics=analytical_metrics
        )

    def _build_insufficient_evidence_response(
        self,
        question: str,
        dataset: Dict[str, Any],
        reason: str,
        timestamp: str
    ) -> AnalysisResponse:
        dataset_id = dataset.get("id", "unknown-dataset")
        dataset_name = dataset.get("name", "Satellite Scene")

        audit_trail: List[AuditStep] = [
            AuditStep(
                step_number=1,
                title="Sensor Ingestion & Query Verification",
                layman_title="Inspecting Satellite Images & Query Scope",
                module="Sensor Ingestion",
                status="verified",
                timestamp=timestamp,
                details=f"Ingested metadata for dataset {dataset_id} ({dataset_name}). Evaluated query: '{question}'.",
                layman_details="SatQuery loaded the available satellite images and checked your question against observable ground data.",
                telemetry={"Dataset": dataset_id, "Query Match": "No Observable Match"}
            ),
            AuditStep(
                step_number=2,
                title="Evidence-Gate Validation",
                layman_title="Checking Evidence Sufficiency Threshold",
                module="VLM Cross-Attention",
                status="flagged",
                timestamp=timestamp,
                details=f"Evidence sufficiency gate triggered: {reason}",
                layman_details="SatQuery refused to guess or hallucinate an answer because sufficient satellite evidence is not present in this image.",
                telemetry={"Sufficiency Status": "INSUFFICIENT_EVIDENCE", "Confidence Score": 0.0}
            )
        ]

        return AnalysisResponse(
            answer=f"Insufficient evidence: {reason}",
            confidence=ConfidenceInfo(
                score=0.0,
                label="insufficient",
                source="demo"
            ),
            confidence_label="insufficient",
            targets_found=0,
            targets=[],
            evidence=[],
            dataset={
                "id": dataset_id,
                "name": dataset_name,
                "region": dataset.get("region", "Target Area")
            },
            audit_trail=audit_trail,
            status="insufficient_evidence",
            analytical_metrics=AnalyticalMetrics(
                signal_to_noise_ratio="N/A",
                spatial_uncertainty="Indeterminate",
                optical_cloud_cover="N/A",
                sar_backscatter_std_dev="0.0 dB",
                model_latency_ms=110,
                cross_attention_score=0.0,
                layman_cloud_cover_text="No conclusive sensor features detected.",
                layman_accuracy_text="Insufficient evidence to provide spatial coordinates."
            )
        )

    def _build_audit_trail(
        self,
        question: str,
        dataset: Dict[str, Any],
        region_str: str,
        target_count: int,
        conf_score: float,
        timestamp: str
    ) -> List[AuditStep]:
        dataset_name = dataset.get("name", "Multimodal Scene")
        return [
            AuditStep(
                step_number=1,
                title="Sensor Ingestion & Alignment",
                layman_title="Loading Satellite Photo & Radar Image",
                module="Sensor Ingestion",
                status="verified",
                timestamp=timestamp,
                details=f"Loaded and coregistered optical and SAR rasters over {region_str} for dataset {dataset.get('id')}.",
                layman_details=f"Loaded standard optical photo and radar passes over {region_str}, aligning both views pixel-by-pixel.",
                telemetry={"Dataset": dataset_name, "Alignment Status": "100% Coregistered"}
            ),
            AuditStep(
                step_number=2,
                title="Radiometric Calibration & Despeckling",
                layman_title="Clearing Weather Noise & Cloud Interference",
                module="Calibration & Radiometry",
                status="verified",
                timestamp=timestamp,
                details="Applied Lee sigma despeckling filter to SAR microwaves; converted beta nought to calibrated sigma nought decibels.",
                layman_details="Cleaned atmospheric noise and converted radar radio waves into clear reflection values.",
                telemetry={"Filter": "Lee Sigma 7x7", "Cloud Penetration": "100% Penetrated"}
            ),
            AuditStep(
                step_number=3,
                title="Multimodal Feature Extraction",
                layman_title="Spotting Water, Plants, & Building Shapes",
                module="Feature Extraction",
                status="verified",
                timestamp=timestamp,
                details="Computed NDWI water index, NDVI green canopy index, and dual-pol SAR cross-ratio backscatter.",
                layman_details="Scanned the scene for water mirrors, green leaves, and building walls using light and radar reflections.",
                telemetry={"Features Extracted": "NDVI, NDWI, SAR Dual-Pol"}
            ),
            AuditStep(
                step_number=4,
                title="VLM Token-to-Pixel Cross-Attention",
                layman_title="Reading Your Question & AI Pattern Matching",
                module="VLM Cross-Attention",
                status="verified",
                timestamp=timestamp,
                details=f"Projected query tokens '{question}' into aligned multimodal embedding space.",
                layman_details=f"SatQuery evaluated your question '{question}' against detected radar signatures.",
                telemetry={"Tokens Analyzed": len(question.split()), "Attention Alignment": "95.4%"}
            ),
            AuditStep(
                step_number=5,
                title="Spatial Bounding Grounding & Telemetry Verification",
                layman_title="Outlining Final Target Boxes on Map",
                module="Bounding & Grounding",
                status="verified",
                timestamp=timestamp,
                details=f"Grounding verified {target_count} targets with mean confidence {conf_score}.",
                layman_details=f"Placed {target_count} highlighted boxes on the map outlining the detected features.",
                telemetry={"Targets": target_count, "Confidence": f"{int(conf_score * 100)}% High Certainty"}
            )
        ]


demo_analysis_provider = DemoAnalysisProvider()
