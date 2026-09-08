"""Pluggable Vision-Language Model interface for remote sensing.

`RemoteSensingVLM` is the seam the rest of the app talks to. Two backends
are provided:

- `MockVLMBackend` — deterministic, dependency-free, always available.
  Used whenever MOCK_INFERENCE=true or the optional ML stack (torch /
  transformers) isn't installed. This is what keeps the CPU-only demo
  reliable for judges.
- `HFVLMBackend` — loads an open-source Hugging Face vision-language
  model (and, optionally, a LoRA adapter fine-tuned on BigEarthNet — see
  training/) lazily on first use.

Swap which backend `RemoteSensingVLM` uses via config; call sites never
change.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Protocol

from app.config import get_settings

try:
    import torch  # noqa: F401
    from transformers import AutoModelForVision2Seq, AutoProcessor  # noqa: F401

    HAS_HF_STACK = True
except Exception:  # noqa: BLE001
    HAS_HF_STACK = False


# ---------------------------------------------------------------------------
# Deterministic scene-level "findings" used by the mock backend. Keyed by a
# stable hash of the image path so the same file always yields the same
# answer during a demo run.
# ---------------------------------------------------------------------------
_SCENE_NARRATIVES = [
    {
        "caption": "A predominantly urban scene with dense built-up structures, a road network, and pockets of residual vegetation.",
        "vqa_default": "The scene shows a built-up area with roads and scattered vegetation; no large water body is visible.",
        "labels": [("Built-up region", 0.93), ("Road network", 0.87), ("Residual vegetation", 0.7)],
    },
    {
        "caption": "Regularly-spaced agricultural parcels bordered by an irrigation channel, with bare soil visible at field margins.",
        "vqa_default": "This is farmland: rectangular cropland parcels with an irrigation channel along one edge.",
        "labels": [("Cropland parcels", 0.92), ("Irrigation channel", 0.8), ("Bare soil field margins", 0.74)],
    },
    {
        "caption": "A river channel bordered by dense riparian vegetation running through an otherwise natural landscape.",
        "vqa_default": "A river runs through the scene, with green riparian vegetation along both banks.",
        "labels": [("Water body", 0.95), ("Riparian vegetation", 0.81)],
    },
    {
        "caption": "A coastal zone where a built-up strip meets the shoreline near an inlet.",
        "vqa_default": "The image shows a coastline with development concentrated near an inlet.",
        "labels": [("Shoreline", 0.9), ("Built-up region", 0.78)],
    },
    {
        "caption": "Dense, continuous forest canopy with a single clearing consistent with recent disturbance.",
        "vqa_default": "Mostly dense forest canopy, with one visible clearing in the scene.",
        "labels": [("Dense canopy", 0.94), ("Clearing / disturbance", 0.67)],
    },
]


def _narrative_for(path: Path):
    digest = hashlib.sha256(str(path).encode()).hexdigest()
    idx = int(digest[:8], 16) % len(_SCENE_NARRATIVES)
    return _SCENE_NARRATIVES[idx]


class VLMBackend(Protocol):
    def caption(self, image_path: Path) -> tuple[str, float]: ...
    def answer_question(self, image_path: Path, question: str) -> tuple[str, float]: ...


class MockVLMBackend:
    """Deterministic, dependency-free backend. Always available."""

    def caption(self, image_path: Path) -> tuple[str, float]:
        narrative = _narrative_for(image_path)
        return narrative["caption"], 0.9

    def answer_question(self, image_path: Path, question: str) -> tuple[str, float]:
        narrative = _narrative_for(image_path)
        q = question.lower()
        if "water" in q:
            has_water = any("water" in l.lower() or "river" in l.lower() for l, _ in narrative["labels"])
            answer = (
                "Yes — a water body is visible in the scene." if has_water else "No prominent water body is visible in this scene."
            )
            return answer, 0.88
        if "building" in q or "urban" in q or "built" in q:
            has_builtup = any("built" in l.lower() or "road" in l.lower() for l, _ in narrative["labels"])
            answer = (
                "Yes — built-up structures are visible in the scene." if has_builtup else "No significant built-up area is visible in this scene."
            )
            return answer, 0.86
        return narrative["vqa_default"], 0.85

    def scene_labels(self, image_path: Path) -> list[tuple[str, float]]:
        return _narrative_for(image_path)["labels"]


class HFVLMBackend:
    """Loads a Hugging Face vision-language model on first use. Optionally
    applies a LoRA adapter checkpoint fine-tuned on BigEarthNet (see
    training/train_lora.py) if VLM_CHECKPOINT_PATH is set.

    NOTE: this is scaffolding for Phase 9 (real model integration) — the
    default HF model referenced here is a general-purpose VLM as a
    placeholder; swap `base_model_id` for the team's chosen remote-sensing
    backbone once selected.
    """

    base_model_id = "Salesforce/blip-image-captioning-base"

    def __init__(self) -> None:
        self._model = None
        self._processor = None

    def _ensure_loaded(self) -> None:
        if self._model is not None:
            return
        if not HAS_HF_STACK:
            raise RuntimeError("transformers/torch are not installed — cannot load the HF VLM backend.")
        settings = get_settings()
        self._processor = AutoProcessor.from_pretrained(self.base_model_id)
        self._model = AutoModelForVision2Seq.from_pretrained(self.base_model_id)
        checkpoint = settings.vlm_checkpoint_path
        if checkpoint:
            try:
                from peft import PeftModel

                self._model = PeftModel.from_pretrained(self._model, checkpoint)
            except Exception as exc:  # noqa: BLE001
                raise RuntimeError(f"Failed to load LoRA checkpoint at '{checkpoint}': {exc}") from exc
        self._model.to(settings.model_device)

    def caption(self, image_path: Path) -> tuple[str, float]:
        self._ensure_loaded()
        from PIL import Image

        image = Image.open(image_path).convert("RGB")
        inputs = self._processor(images=image, return_tensors="pt")
        out = self._model.generate(**inputs, max_new_tokens=40)
        text = self._processor.decode(out[0], skip_special_tokens=True)
        return text, 0.75  # HF backend does not expose a calibrated confidence

    def answer_question(self, image_path: Path, question: str) -> tuple[str, float]:
        # BLIP-base (the placeholder model) is caption-only; a real VQA-capable
        # remote-sensing VLM would use its question-conditioned generate call
        # here instead. Falls back to captioning + a templated answer.
        caption, _ = self.caption(image_path)
        return f"Based on the scene ({caption}), regarding '{question}': see caption for visible content.", 0.6


class RemoteSensingVLM:
    """Facade used by the rest of the app. Selects a backend based on
    settings.mock_inference and dependency availability."""

    def __init__(self) -> None:
        self._backend: VLMBackend | None = None

    def load(self) -> None:
        settings = get_settings()
        if settings.mock_inference or not HAS_HF_STACK:
            self._backend = MockVLMBackend()
        else:
            self._backend = HFVLMBackend()

    def _get_backend(self) -> VLMBackend:
        if self._backend is None:
            self.load()
        return self._backend  # type: ignore[return-value]

    def caption(self, image_path: Path) -> tuple[str, float]:
        return self._get_backend().caption(image_path)

    def answer_question(self, image_path: Path, question: str) -> tuple[str, float]:
        return self._get_backend().answer_question(image_path, question)

    def scene_labels(self, image_path: Path) -> list[tuple[str, float]]:
        backend = self._get_backend()
        if isinstance(backend, MockVLMBackend):
            return backend.scene_labels(image_path)
        # HF backend: derive rough labels from the caption as a fallback.
        caption, _ = backend.caption(image_path)
        return [(caption[:40], 0.6)]


# Lazily-instantiated module-level singleton — the model itself is only
# loaded (backend selected / weights pulled) on first actual use.
_vlm_singleton: RemoteSensingVLM | None = None


def get_vlm() -> RemoteSensingVLM:
    global _vlm_singleton
    if _vlm_singleton is None:
        _vlm_singleton = RemoteSensingVLM()
    return _vlm_singleton
