from fastapi import APIRouter
from app.schemas.dataset import DatasetListResponse
from app.services.dataset_service import dataset_service

router = APIRouter(tags=["Datasets"])


@router.get("/datasets", response_model=DatasetListResponse)
async def list_datasets():
    """
    Retrieve available satellite scenario metadata records.
    NOTE: These are dataset catalog records, not actual satellite rasters.
    """
    return dataset_service.list_datasets()
