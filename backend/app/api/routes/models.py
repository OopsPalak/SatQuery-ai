from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings
from app.models.vlm import HAS_HF_STACK

router = APIRouter(tags=["models"])


@router.get("/api/models")
def list_models():
    settings = get_settings()
    status = "ready"
    return [
        {
            "name": "Remote Sensing VLM",
            "task": "VQA + Captioning",
            "modality": ["optical", "multispectral"],
            "status": status,
            "version": "mock-1.0" if settings.mock_inference else ("hf-baseline-1.0" if HAS_HF_STACK else "unavailable"),
            "adaptation": "LoRA fine-tune on VRSBench + RSVQA (planned)" if not settings.mock_inference else "Deterministic mock backend",
        },
        {
            "name": "Change Detection Model",
            "task": "Bi-temporal analysis",
            "modality": ["optical"],
            "status": "ready",
            "version": "baseline-diff-1.0",
            "adaptation": "Classical image-difference baseline; CDVQA-trained model planned",
        },
        {
            "name": "SAR Analysis Model",
            "task": "SAR interpretation",
            "modality": ["sar"],
            "status": "ready",
            "version": "baseline-1.0",
            "adaptation": "Backscatter-statistics baseline; trained SAR model planned",
        },
        {
            "name": "Grounding Head",
            "task": "Region + object grounding",
            "modality": ["optical", "sar"],
            "status": "ready",
            "version": "baseline-1.0",
            "adaptation": "Deterministic heuristic grounding; referring-expression adapter planned",
        },
    ]


@router.get("/api/datasets")
def list_datasets():
    return [
        {"name": "BigEarthNet", "purpose": "Remote sensing VLM adaptation / pretraining"},
        {"name": "VRSBench", "purpose": "Captioning, grounding and VQA evaluation"},
        {"name": "RSVQA", "purpose": "Remote sensing visual question answering"},
        {"name": "CDVQA", "purpose": "Bi-temporal change detection VQA"},
    ]
