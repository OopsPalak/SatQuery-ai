# SatQuery AI — Frontend Prototype

A high-fidelity frontend prototype for **SatQuery AI**, an agentic vision-language
assistant for multimodal remote-sensing image analysis. Dark satellite
mission-control aesthetic, built to be dropped in front of a real backend.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Lucide icons · React Router

## Run it

```bash
npm install
npm run dev       # starts on http://localhost:5173
```

```bash
npm run build      # type-checks and builds to /dist
npm run preview    # serve the production build locally
```

## Structure

```
src/
  components/   Sidebar, Header, UploadPanel, ImageViewer, QueryConsole,
                AgentTrace, AnalysisResult, ConfidenceScore, EvidencePanel,
                ComparisonViewer, LayerControl, ReportModal, DatasetCard, ModelCard
  pages/        Landing, Dashboard, Analysis, History, Datasets, Models,
                Reports, Settings
  lib/
    api.ts      Backend-ready placeholder client — every function mirrors a
                real REST route (POST /api/analyze, /api/upload,
                /api/change-detection, /api/cross-modal, /api/grounding,
                GET /api/history, /api/models, /api/datasets, POST /api/report)
                and currently resolves against mock data. Swap the body of
                each function for a fetch() call — call sites don't change.
    mockData.ts Sample scenes, evidence, agent-trace steps, history, datasets,
                models, system status
  types/        Shared TypeScript interfaces (SceneMeta, AnalysisResult,
                AgentStep, EvidenceItem, HistoryEntry, DatasetInfo, ModelInfo...)
```

## What's implemented

- **Landing page** — hero, modality cards, "image → insight" flow, launch CTA
- **Dashboard** — hero panel + 4 quick-analysis entry cards (Single Image,
  Change Analysis, Optical+SAR, Region Grounding)
- **Analysis Workspace** (the centerpiece) — 3-column layout:
  - Input panel: drag-and-drop upload with format validation, analysis-type
    selector, parsed metadata (dimensions, CRS, resolution, sensor, etc.)
  - Center: interactive image viewer (zoom/pan/fullscreen/grid/scale/north
    arrow), layer toggles (Original/AI Detection/Grounding/Change Map),
    evidence bounding boxes drawn over the scene, before/after comparison
    slider with a Change Summary panel (built-up/vegetation/water delta %,
    low→high change legend) for change analysis, a dedicated **Cross-Modal
    Workspace** (side-by-side Optical/SAR panels + fused-interpretation
    panel with independent layer toggles) for Optical+SAR analysis, natural-
    language query console with suggested prompts, and a live **AI Agent
    Execution** trace that progressively reveals each pipeline step
    (validate → detect modality → classify query → select model → reason →
    extract evidence → estimate confidence → generate response) with
    expandable per-step detail
  - Right: AI response panel — summary, circular confidence score, evidence
    cards, Generate Report / Export actions
  - **Try Demo** button auto-loads a sample scene and runs a full query end
    to end for hackathon demos without needing a real upload
  - Region-grounding mode surfaces class, confidence, approximate area and
    coordinates for the detected region
- **History** — card grid of past analyses with a detail modal
- **Datasets** / **Models** — BigEarthNet, VRSBench, RSVQA, CDVQA and the
  four specialist models (VLM, change detection, SAR, grounding) with status
- **Reports** — list of generated reports with download affordance
- **Settings** — system status panel (AI Engine, VLM, Change Detection, SAR
  Processor, Geospatial Engine, Agent Controller) and analyst profile

All imagery is Unsplash-hosted aerial photography standing in for real
GeoTIFF scenes — swap `SAMPLE_SCENES` thumbnails in `lib/mockData.ts` for
signed URLs from your imagery service.

## Wiring up the real backend

Everything the UI needs from a backend goes through `src/lib/api.ts`. Replace
each function body with a `fetch()` (or your API client of choice) against
the FastAPI routes it's named after — the mock delay/shape is there so the
UI's loading and empty states already work correctly once real data starts
flowing in.
