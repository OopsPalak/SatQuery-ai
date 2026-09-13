from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_datasets():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert isinstance(data["datasets"], list)
    assert len(data["datasets"]) > 0

    # Verify sentinel-1-demo and sentinel-2-demo presence
    dataset_ids = [d["id"] for d in data["datasets"]]
    assert "sentinel-1-demo" in dataset_ids
    assert "sentinel-2-demo" in dataset_ids

    # Validate dataset record structure
    first = data["datasets"][0]
    assert "id" in first
    assert "name" in first
    assert "sensor" in first
    assert "type" in first
    assert "available" in first
    assert isinstance(first["available"], bool)
