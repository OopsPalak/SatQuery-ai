# SatQuery AI Backend Foundation

FastAPI backend foundation for **SatQuery AI**, an evidence-gated geospatial intelligence assistant for multimodal satellite imagery.

---

## 1. Requirements

- **Python**: 3.10, 3.11, 3.12, or 3.13
- **Pip**: Latest version
- **Virtual Environment**: Recommended (`venv`)

---

## 2. Architecture Overview

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & CORS middleware
│   ├── config.py                # Environment configuration settings via Pydantic
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py        # GET /api/health
│   │   │   ├── datasets.py      # GET /api/datasets
│   │   │   └── analysis.py      # POST /api/analyze
│   │   └── __init__.py          # API router aggregation
│   ├── schemas/
│   │   ├── dataset.py           # Dataset request/response schemas
│   │   └── analysis.py          # Query, Evidence, Audit, and Metrics schemas
│   ├── services/
│   │   ├── dataset_service.py   # Satellite scene & dataset registry
│   │   ├── evidence_service.py  # Evidence normalization & validation
│   │   └── analysis_service.py  # Query orchestration & provider delegation
│   ├── ai/
│   │   ├── base_provider.py     # Abstract AnalysisProvider interface
│   │   └── demo_provider.py     # Deterministic, evidence-gated demo provider
│   └── geospatial/              # Coordinate & spatial transformations (reserved)
├── tests/
│   ├── test_health.py           # Health endpoint tests
│   ├── test_datasets.py         # Dataset catalog tests
│   └── test_analysis.py         # Analysis & insufficient-evidence tests
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # Backend documentation
```

### Core Architecture Principles

1. **Separation of Concerns**: API routes are thin controllers. All business logic lives in `services/`.
2. **Provider Abstraction**: Analysis logic is decoupled behind the `AnalysisProvider` abstract interface. Real models or satellite provider APIs (e.g., Sentinel Hub, Gemini VLM) can drop in without touching route handlers.
3. **Evidence-Gated Principle**: If observable evidence is absent or unsupported, the backend returns an `insufficient_evidence` response rather than hallucinating an answer.
4. **Demo Provenance**: Every demo evidence observation and confidence score is explicitly marked with `source: "demo"` and `is_demo: true`.

---

## 3. Setup and Installation

### Step 1: Create a Virtual Environment (Optional but Recommended)

On Windows (PowerShell):
```powershell
cd d:\Projects\SatQuery-ai\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

On macOS / Linux:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` contents:
```env
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
FRONTEND_ORIGIN=http://localhost:5173
```

---

## 4. Running the Backend

Start the development server with Uvicorn:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 5. API Endpoints & Usage

### 1. `GET /api/health`
Verifies that the backend service is alive and healthy.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "satquery-backend"
}
```

---

### 2. `GET /api/datasets`
Lists available satellite datasets and scene metadata.

**Response (200 OK):**
```json
{
  "datasets": [
    {
      "id": "sentinel-1-demo",
      "name": "Sentinel-1 Radar (C-Band Synthetic Aperture Radar)",
      "sensor": "SAR",
      "type": "radar",
      "available": true,
      "region": "Global Orbit Coverage",
      "coordinates": "Variable Swath",
      "description": "All-weather day-and-night C-band synthetic aperture radar..."
    },
    {
      "id": "sentinel-2-demo",
      "name": "Sentinel-2 Optical (Multispectral MSI)",
      "sensor": "Optical",
      "type": "optical",
      "available": true,
      "region": "Global Land Surface",
      "coordinates": "Variable Swath",
      "description": "High-resolution multispectral optical imagery..."
    }
  ]
}
```

---

### 3. `POST /api/analyze`
Submits a natural language query for satellite imagery analysis.

**Request Payload:**
```json
{
  "question": "Where is the active landslide?",
  "dataset_id": "ds-himalayas-landslide-2026",
  "region": {
    "latitude": 30.7268,
    "longitude": 78.4354,
    "name": "Uttarkashi Highway Corridor"
  }
}
```

**Success Response (200 OK):**
```json
{
  "answer": "[DEVELOPMENT DEMO] SatQuery AI Analysis: Outlined 1 active landslide scarp in Uttarkashi Highway Corridor. Sentinel-1 radar phase coherence dropped to 0.05...",
  "confidence": {
    "score": 0.93,
    "label": "high",
    "source": "demo"
  },
  "confidence_label": "high",
  "targets_found": 1,
  "targets": [
    {
      "id": "det-slide-01",
      "type": "spatial_detection",
      "label": "Active Mountain Landslide Slope",
      "category": "landslide",
      "layman_category": "Unstable Landslide Area",
      "confidence": 0.93,
      "iou_score": 0.88,
      "bbox": [38.0, 30.0, 26.0, 32.0],
      "coordinates": {
        "lat": 30.735,
        "lon": 78.442
      },
      "optical_reflection": {
        "rgb": "#6e5843",
        "nirValue": 0.19,
        "ndvi": 0.08,
        "ndwi": -0.15
      },
      "sar_backscatter": {
        "vv_dB": -14.2,
        "vh_dB": -21.0,
        "ratio_dB": 6.8,
        "coherence": 0.05
      },
      "evidence_description": "Loss of radar interferometric phase stability (0.05 coherence) confirms active ground soil displacement along steep scarp.",
      "layman_explanation": "Radar pulse decorrelation confirms loose dirt and rocks are actively sliding down this steep mountain slope.",
      "layman_ground_type": "Active Landslide Dirt Scarp",
      "source": "demo",
      "dataset": "ds-himalayas-landslide-2026",
      "is_demo": true
    }
  ],
  "evidence": [ /* Same as targets */ ],
  "dataset": {
    "id": "ds-himalayas-landslide-2026",
    "name": "Himalayan Mountain Landslide & Debris Safety",
    "region": "Uttarkashi Highway Corridor, Uttarakhand"
  },
  "audit_trail": [
    {
      "step_number": 1,
      "title": "Sensor Ingestion & Alignment",
      "layman_title": "Loading Satellite Photo & Radar Image",
      "module": "Sensor Ingestion",
      "status": "verified",
      "timestamp": "2026-09-13 10:05:00 UTC",
      "details": "Loaded and coregistered optical and SAR rasters...",
      "layman_details": "Loaded standard optical photo and radar passes...",
      "telemetry": { "Dataset": "Himalayan Mountain Landslide & Debris Safety" }
    }
    /* 5 steps total */
  ],
  "status": "success",
  "analytical_metrics": {
    "signal_to_noise_ratio": "19.4 dB",
    "spatial_uncertainty": "± 2.0 meters (Demo Calibrated)",
    "optical_cloud_cover": "12% Minor Clouds",
    "sar_backscatter_std_dev": "3.1 dB",
    "model_latency_ms": 315,
    "cross_attention_score": 0.945,
    "layman_cloud_cover_text": "Radar microwaves penetrated cloud cover for 100% ground visibility.",
    "layman_accuracy_text": "High precision geolocation (±2m)."
  }
}
```

---

### 4. Insufficient Evidence Response
When an inquiry targets unsupported features, out-of-domain phenomena, or areas without observable signatures:

**Request:**
```json
{
  "question": "Find underground nuclear bunker facilities",
  "dataset_id": "sentinel-1-demo"
}
```

**Response (200 OK):**
```json
{
  "answer": "Insufficient evidence: No corresponding sensor evidence or spatial backscatter signatures match the requested query within this satellite dataset coverage.",
  "confidence": {
    "score": 0.0,
    "label": "insufficient",
    "source": "demo"
  },
  "confidence_label": "insufficient",
  "targets_found": 0,
  "targets": [],
  "evidence": [],
  "status": "insufficient_evidence",
  "audit_trail": [
    {
      "step_number": 1,
      "title": "Sensor Ingestion & Query Verification",
      "layman_title": "Inspecting Satellite Images & Query Scope",
      "module": "Sensor Ingestion",
      "status": "verified",
      "timestamp": "...",
      "details": "...",
      "layman_details": "...",
      "telemetry": { "Sufficiency Status": "INSUFFICIENT_EVIDENCE" }
    }
  ]
}
```

---

## 6. Current Implementation Status vs. Production Roadmap

| Component | Current MVP Implementation | Future Production Implementation |
|---|---|---|
| **API Layer** | FastAPI with CORS & Pydantic V2 | Unchanged (Production-ready) |
| **Analysis Provider** | `DemoAnalysisProvider` (deterministic, grounded) | `SentinelHubProvider` / `GeminiVLMProvider` |
| **Confidence Scoring** | `source: "demo"` calibrated range | Temperature-calibrated model softmax probabilities |
| **Evidence Validation** | `EvidenceService` ensuring demo tagging | Real GDAL/Rasterio pixel extraction & validation |
| **Data Ingestion** | In-memory dataset records | STAC API / Copernicus Open Access Hub / ISRO Bhuvan |
| **Persistence** | Stateless / In-memory | SQLite / PostgreSQL + PostGIS |

---

## 7. Running Tests

Execute the automated test suite with pytest:

```powershell
python -m pytest tests/ -v
```
