"""The agentic orchestrator.

`run()` is the single entry point used by the /api/analyze route. It does
not call one fixed model — it inspects the number of images supplied,
their detected modality, and the query text, classifies the task, routes
to the appropriate specialist module, and assembles a structured response
with an observable execution trace.

The trace is a flat list of named, timestamped steps — never raw model
reasoning or chain-of-thought — matching the SIH requirement for
auditability without exposing internal deliberation.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.schemas.agent import AgentDecision, ExecutionStep
from app.schemas.common import Modality, StepStatus, TaskType
from app.services import confidence as confidence_service
from app.services import evidence as evidence_service
from app.services import query_classifier
from app.storage import file_storage


class AgentError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _step(n: int, name: str, status: StepStatus, details: str | None = None) -> ExecutionStep:
    return ExecutionStep(step=n, name=name, status=status, details=details, timestamp=_now())


def _resolve_files(file_ids: list[str]) -> list[dict]:
    records = []
    for fid in file_ids:
        record = file_storage.get_file_record(fid)
        if not record:
            raise AgentError("FILE_NOT_FOUND", f"Unknown file_id '{fid}'. Upload the file first or use /api/demo/load.")
        records.append(record)
    return records


def decide_task(records: list[dict], query: str) -> AgentDecision:
    """Pure routing decision — used both by run() and exposed indirectly via
    the execution trace for transparency."""
    image_count = len(records)
    modalities = [r.get("modality") for r in records]
    has_sar = Modality.SAR.value in modalities

    classification = query_classifier.classify(query, image_count=image_count, has_sar=has_sar)

    specialist_by_task = {
        TaskType.SINGLE_IMAGE_VQA: "Remote Sensing VLM (VQA)",
        TaskType.CAPTIONING: "Remote Sensing VLM (Captioning)",
        TaskType.REGION_GROUNDING: "Grounding Head",
        TaskType.CHANGE_DETECTION: "Change Detection Model",
        TaskType.OPTICAL_SAR_ANALYSIS: "SAR Analysis Model + Remote Sensing VLM",
    }

    return AgentDecision(
        task=classification.task.value,
        modality=modalities[0] if modalities else "unknown",
        image_count=image_count,
        specialist=specialist_by_task[classification.task],
        reason=classification.reason,
    )


def run(file_ids: list[str], query: str, mode: str = "auto") -> dict:
    """Executes the full agentic pipeline and returns a dict matching
    AnalyzeResponse (built by the route layer into the Pydantic model)."""
    trace: list[ExecutionStep] = []
    step_n = 1

    # Step 1 — input validation
    try:
        records = _resolve_files(file_ids)
    except AgentError as exc:
        trace.append(_step(step_n, "Input Validation", StepStatus.FAILED, exc.message))
        raise
    trace.append(_step(step_n, "Input Validation", StepStatus.COMPLETED, f"{len(records)} file(s) resolved"))
    step_n += 1

    # Step 2 — modality detection
    modalities = [r.get("modality", "unknown") for r in records]
    modality_summary = ", ".join(modalities) if len(set(modalities)) > 1 else (modalities[0] if modalities else "unknown")
    trace.append(_step(step_n, "Modality Detection", StepStatus.COMPLETED, modality_summary.capitalize()))
    step_n += 1

    # Step 3 — query classification (respecting an explicit mode override)
    decision = decide_task(records, query)
    if mode != "auto":
        override = {
            "single": TaskType.SINGLE_IMAGE_VQA,
            "change": TaskType.CHANGE_DETECTION,
            "fusion": TaskType.OPTICAL_SAR_ANALYSIS,
            "grounding": TaskType.REGION_GROUNDING,
        }.get(mode)
        if override:
            decision.task = override.value
    trace.append(_step(step_n, "Query Classification", StepStatus.COMPLETED, decision.task.replace("_", " ").title()))
    step_n += 1

    # Step 4 — specialist selection
    trace.append(_step(step_n, "Specialist Selection", StepStatus.COMPLETED, decision.specialist))
    step_n += 1

    # Step 5 — execution (delegates to the right specialist module)
    result = _execute(decision, records, query)
    trace.append(_step(step_n, "Analysis Execution", StepStatus.COMPLETED, "Specialist analysis completed"))
    step_n += 1

    # Step 6 — evidence generation
    trace.append(_step(step_n, "Evidence Generation", StepStatus.COMPLETED, f"{len(result['evidence'])} evidence item(s)"))
    step_n += 1

    # Step 7 — confidence estimation
    breakdown = confidence_service.estimate_confidence(
        model_confidence=result.get("model_confidence"),
        has_valid_geo_metadata=all(r.get("crs") for r in records),
    )
    trace.append(_step(step_n, "Confidence Estimation", StepStatus.COMPLETED, breakdown.level.value.capitalize()))
    step_n += 1

    analysis_id = f"analysis_{uuid.uuid4().hex[:10]}"

    return {
        "analysis_id": analysis_id,
        "query": query,
        "task": decision.task,
        "answer": result["answer"],
        "confidence": breakdown.score,
        "confidence_breakdown": breakdown,
        "evidence": result["evidence"],
        "visualizations": result.get("visualizations", []),
        "execution_trace": trace,
        "metadata": {"decision": decision.model_dump(), "file_ids": file_ids},
        "model_used": decision.specialist,
        "timestamp": _now(),
    }


def _execute(decision: AgentDecision, records: list[dict], query: str) -> dict:
    from app.models import captioning, change_detection, optical_sar, vqa, grounding
    from app.geospatial.raster import read_raster_info

    task = decision.task
    primary_path = Path(records[0]["path"])

    if task == TaskType.SINGLE_IMAGE_VQA.value:
        answer, conf = vqa.answer(primary_path, query)
        labels = vqa.scene_labels(primary_path)
        return {"answer": answer, "model_confidence": conf, "evidence": evidence_service.evidence_from_labels(labels)}

    if task == TaskType.CAPTIONING.value:
        caption, conf = captioning.caption(primary_path)
        labels = vqa.scene_labels(primary_path)
        return {"answer": caption, "model_confidence": conf, "evidence": evidence_service.evidence_from_labels(labels)}

    if task == TaskType.REGION_GROUNDING.value:
        info = read_raster_info(primary_path)
        detections, conf = grounding.ground(primary_path, query, info)
        answer = f"Located {len(detections)} region(s) matching '{query}'."
        return {"answer": answer, "model_confidence": conf, "evidence": evidence_service.evidence_from_detections(detections)}

    if task == TaskType.CHANGE_DETECTION.value:
        if len(records) < 2:
            raise AgentError("INCOMPATIBLE_INPUT", "Change detection requires two images (before and after).")
        before_path, after_path = Path(records[0]["path"]), Path(records[1]["path"])
        result = change_detection.detect_change(before_path, after_path)
        summary = change_detection.summarize(result)
        labels = [
            (f"Built-up area change {result['built_up_delta_pct']:+.1f}%", 0.85),
            (f"Vegetation change {result['vegetation_delta_pct']:+.1f}%", 0.8),
            (f"Water extent change {result['water_delta_pct']:+.1f}%", 0.75),
        ]
        return {
            "answer": summary,
            "model_confidence": result["confidence"],
            "evidence": evidence_service.evidence_from_labels(labels),
        }

    if task == TaskType.OPTICAL_SAR_ANALYSIS.value:
        if len(records) < 2:
            raise AgentError("INCOMPATIBLE_INPUT", "Optical+SAR analysis requires two co-registered images.")
        optical_rec, sar_rec = records[0], records[1]
        if sar_rec.get("modality") != Modality.SAR.value and optical_rec.get("modality") == Modality.SAR.value:
            optical_rec, sar_rec = sar_rec, optical_rec
        result = optical_sar.analyze_optical_sar(Path(optical_rec["path"]), Path(sar_rec["path"]), query)
        labels = [(obs, 0.82) for obs in result["fused_observations"]]
        return {
            "answer": result["answer"],
            "model_confidence": result["confidence"],
            "evidence": evidence_service.evidence_from_labels(labels),
        }

    raise AgentError("ANALYSIS_FAILED", f"No specialist available for task '{task}'.")
