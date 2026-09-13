# SatQuery AI

**Evidence-gated geospatial intelligence assistant for multimodal satellite imagery.**

SatQuery AI enables analysts and everyday users to ask natural-language questions about satellite imagery (Optical & Synthetic Aperture Radar / SAR), receiving grounded, auditable answers with calibrated confidence ratings and interactive visual evidence.

---

## Repository Structure

```
SatQuery-ai/
├── backend/               # Python + FastAPI backend service
│   ├── app/               # FastAPI application, services, schemas, and AI providers
│   ├── tests/             # Pytest automated test suite
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Backend environment variables
│   └── README.md          # Dedicated backend guide & documentation
├── src/                   # React + TypeScript + Vite frontend
│   ├── components/        # MapViewport, ChatInterface, VisualEvidencePanel, etc.
│   ├── services/          # Frontend API integration service (api.ts)
│   ├── data/              # Sample dataset metadata
│   ├── types/             # Remote sensing TypeScript definitions
│   └── utils/             # GIS and analytical calculation utilities
├── package.json           # Frontend dependencies & scripts
└── README.md              # Project documentation
```

---

## Quickstart Guide

### 1. Start the FastAPI Backend

In a terminal:
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Start the React Frontend

In a second terminal:
```powershell
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## Key Features

- **Multimodal Remote Sensing**: Compare optical space photography with all-weather Synthetic Aperture Radar (SAR) using an interactive side-by-side split slider.
- **Evidence-Gated Intelligence**: Refuses to hallucinate answers when satellite evidence is insufficient (`status: "insufficient_evidence"`).
- **Auditable AI Trail**: Every finding includes a 5-step reproducible engineering audit trail detailing sensor ingestion, despeckle filtering, feature extraction, cross-attention matching, and spatial grounding.
- **Grounded Evidence HUD**: Interactive bounding boxes linked directly to physical sensor telemetry (radar backscatter in dB, NDWI water index, NDVI vegetation index).
