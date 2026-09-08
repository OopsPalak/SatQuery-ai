# SatQuery AI — Backend

FastAPI backend for **SatQuery AI**, an agentic vision-language assistant for
multimodal remote-sensing image analysis. Built to sit behind the existing
`satquery-ai` React frontend without requiring any frontend changes.

Runs fully on CPU with **no ML dependencies required** — `MOCK_INFERENCE=true`
(the default) drives every specialist through deterministic, metadata-aware
baselines, so the complete pipeline (upload → agent → specialist → evidence →
confidence → execution trace) works end to end for a hackathon demo without a
GPU or any downloaded model weights.

---

## 1. Architecture

```
Frontend (React)
      ↓
FastAPI (app/main.py)
      ↓
Input Validation (services/file_validator.py)
      ↓
Agentic Controller (services/agent.py)
      ↓
Query + Modality Understanding (services/query_classifier.py, geospatial/metadata.py)
      ↓
Specialist Model (app/models/*.py)
  ├── VQA / Captioning     (vqa.py, captioning.py, vlm.py)
  ├── Region Grounding     (grounding.py)
  ├── Change Detection     (change_detection.py)
  └── Optical + SAR Fusion (optical_sar.py)
      ↓
Evidence Generation (services/evidence.py, geospatial/overlays.py)
      ↓
Confidence (services/confidence.py)
      ↓
Auditable Execution Trace (schemas/agent.py)
      ↓
Structured JSON Response
      ↓
Frontend Visualization
```

The agent (`services/agent.py`) is the seam that makes this more than "upload
→ ChatGPT → answer": it inspects image count, detected modality, and query
intent to route to a specific specialist, and every step it takes is recorded
as a named, timestamped trace entry — never raw chain-of-thought.

Every specialist model file (`app/models/*.py`) exposes a small, stable
function signature. The body is currently a deterministic baseline; swapping
in a real fine-tuned model later means editing the inside of that function,
not any caller.

---

## 2. Installation

```bash
cd backend
python -m venv venv
```

Activate it:

```bash
# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

**Note:** `requirements.txt` is split into sections. The **core section
(FastAPI, Pydantic, NumPy, Pillow)** is all you need to run the full demo
pipeline. The AI/ML section (torch, transformers, peft...) and the geospatial
section (rasterio, GDAL, geopandas...) are only needed once you wire in a
real model or need true GeoTIFF/CRS handling — the app detects their absence
and falls back to lightweight/mocked behavior automatically. GDAL in
particular often needs a system package first:

```bash
# Debian/Ubuntu, only if you want real GeoTIFF/CRS support
sudo apt install gdal-bin libgdal-dev
pip install gdal=="$(gdal-config --version)"
```

Copy the environment file:

```bash
cp .env.example .env
```

---

## 3. Running the backend

```bash
uvicorn app.main:app --reload --port 8000
```

or:

```bash
python run.py
```

Visit `http://localhost:8000/docs` for interactive OpenAPI docs, or
`http://localhost:8000/api/health` for a liveness check.

---

## 4. Running tests

```bash
pytest -q
```

26 tests cover health, upload validation, metadata extraction, query
classification, agent routing, change detection, optical-SAR validation,
confidence generation, and a full analyze→history→report round trip.

---

## 5. API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/system/status` | Per-component status (agent, VLM, change detection, SAR, storage) |
| POST | `/api/upload` | Upload one image (`file` field), returns metadata + `file_id` |
| GET | `/api/upload/{file_id}/metadata` | Re-fetch metadata for a previously uploaded file |
| POST | `/api/analyze` | Generic auto-routed entry point — agent classifies task & selects specialist |
| POST | `/api/analyze/caption` | Direct captioning/scene-description call |
| POST | `/api/analyze/ground` | Region grounding — returns bounding boxes + overlay image |
| POST | `/api/analyze/change` | Bi-temporal change detection between two images |
| POST | `/api/analyze/multimodal` | Optical + SAR cross-modal fusion analysis |
| GET | `/api/history` | List past analyses |
| GET | `/api/history/{analysis_id}` | Full stored record for one analysis |
| POST | `/api/reports/{analysis_id}` | Generate an HTML report, returns `report_url` |
| GET | `/api/datasets` | Datasets used/supported (BigEarthNet, VRSBench, RSVQA, CDVQA) |
| GET | `/api/models` | Specialist model registry + status |
| POST | `/api/demo/load` | Loads sample scenes from `data/samples/` for judge-safe demoing |

Generated imagery (previews, overlays, change maps, reports) is served as
static files under `/uploads/*`, `/processed/*`, and `/results/*`.

All errors return the structured envelope:

```json
{ "error": true, "code": "FILE_NOT_FOUND", "message": "..." }
```

---

## 6. Connecting the React frontend

The frontend already has a mock API layer at `satquery-ai/src/lib/api.ts` —
every function there is named after and shaped like a real backend route.
To wire it up:

1. Start this backend on `http://localhost:8000`.
2. In the frontend `.env` (or wherever `VITE_API_URL` is read), point it at
   `http://localhost:8000`.
3. Replace the mock bodies in `src/lib/api.ts` with `fetch()` calls to the
   matching endpoint above — the response shapes were designed to match the
   frontend's TypeScript interfaces in `src/types/index.ts` (`SceneMeta`,
   `AnalysisResult`, `AgentStep`, `EvidenceItem`, `HistoryEntry`,
   `DatasetInfo`, `ModelInfo`) directly, field for field, so this should be a
   near-mechanical swap rather than a redesign.
4. `ALLOWED_ORIGINS` / `FRONTEND_URL` in `.env` already includes
   `http://localhost:5173` (Vite's default) and `http://localhost:3000`.

---

## 7. Dataset preparation & LoRA fine-tuning

The `training/` directory is a separate, opt-in pipeline — nothing here runs
automatically or downloads anything when the backend starts.

```bash
python training/prepare_dataset.py   # prepares a BigEarthNet-style dataset
python training/train_lora.py        # LoRA fine-tune over a HF base VLM
python training/evaluate.py          # evaluate the resulting checkpoint
```

Once you have a checkpoint, point `VLM_CHECKPOINT_PATH` in `.env` at it and
set `MOCK_INFERENCE=false`; `app/models/vlm.py` picks it up from there. See
`training/README.md` for details.

---

## 8. Demo mode

`POST /api/demo/load` loads the five procedurally-generated sample scenes in
`data/samples/` (urban, agricultural, river, coastal/SAR, forest) and returns
ready-to-use `file_id`s — so the full **upload → query → agent → specialist →
result → evidence → confidence → execution trace** flow can be demonstrated
without a real upload or a GPU. This mirrors the frontend's "Try Demo"
button.

---

## 9. What's real vs. placeholder

**Real, not mocked:**
- Input validation (extension/MIME/size/count/corruption checks)
- Filename sanitization, upload path safety
- Query classification (rule-based, swappable)
- Agent routing logic
- Change detection baseline (classical image-difference)
- Confidence scoring (system-level, combining heuristic factors)
- History persistence (SQLite)
- Report generation (HTML)
- Metadata extraction when rasterio/GDAL are installed

**Deterministic mock, isolated behind a stable interface, meant to be
replaced:**
- `app/models/vlm.py` — VQA/captioning answers (swap in a fine-tuned HF model
  via `VLM_CHECKPOINT_PATH`)
- `app/models/grounding.py` — bounding boxes are heuristic, not a trained
  detector
- `app/models/optical_sar.py` — fusion narrative is templated from basic
  band/backscatter statistics, not a trained cross-modal model

None of this is hidden: every mock function has a docstring pointing at
exactly what it stands in for.
