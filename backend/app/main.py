from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_router

app = FastAPI(
    title="SatQuery AI Backend",
    description=(
        "Evidence-gated geospatial intelligence assistant API for satellite imagery. "
        "Provides structured remote sensing analysis, reproducible reasoning audit trails, "
        "and calibrated confidence ratings."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes under /api
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "message": "SatQuery AI Backend is running.",
        "docs": "/docs",
        "health": "/api/health",
        "datasets": "/api/datasets"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True
    )
