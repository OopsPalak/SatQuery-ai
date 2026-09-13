from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_analyze_landslide_success():
    payload = {
        "question": "Where is the active landslide?",
        "dataset_id": "ds-himalayas-landslide-2026",
        "region": {
            "latitude": 30.7268,
            "longitude": 78.4354
        }
    }
    response = client.post("/api/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "landslide" in data["answer"].lower()
    assert data["targets_found"] >= 1
    assert len(data["targets"]) >= 1
    assert len(data["evidence"]) >= 1

    # Check Confidence model
    assert "confidence" in data
    assert data["confidence"]["source"] == "demo"
    assert data["confidence"]["score"] > 0.8
    assert data["confidence"]["label"] in ["high", "medium"]
    assert data["confidence_label"] == data["confidence"]["label"]

    # Check Evidence model
    first_target = data["targets"][0]
    assert first_target["category"] == "landslide"
    assert first_target["is_demo"] is True
    assert first_target["source"] == "demo"
    assert "bbox" in first_target
    assert len(first_target["bbox"]) == 4
    assert "coordinates" in first_target

    # Check Audit Trail (5 reproducible stages)
    assert "audit_trail" in data
    assert len(data["audit_trail"]) == 5
    assert data["audit_trail"][0]["step_number"] == 1
    assert data["audit_trail"][4]["step_number"] == 5

    # Check Analytical Metrics
    assert "analytical_metrics" in data
    assert data["analytical_metrics"] is not None
    assert "signal_to_noise_ratio" in data["analytical_metrics"]


def test_analyze_maritime_success():
    payload = {
        "question": "Detect all cargo container ships in the port",
        "dataset_id": "ds-mumbai-maritime-vessel-2026"
    }
    response = client.post("/api/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["targets_found"] >= 1
    assert any(t["category"] == "vessel" for t in data["targets"])


def test_analyze_insufficient_evidence():
    payload = {
        "question": "Find underground nuclear bunker facilities",
        "dataset_id": "sentinel-1-demo"
    }
    response = client.post("/api/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "insufficient_evidence"
    assert "insufficient evidence" in data["answer"].lower()
    assert data["confidence"]["score"] == 0.0
    assert data["confidence"]["label"] == "insufficient"
    assert data["confidence_label"] == "insufficient"
    assert data["targets_found"] == 0
    assert data["targets"] == []
    assert data["evidence"] == []


def test_analyze_invalid_request_missing_question():
    payload = {
        "dataset_id": "sentinel-1-demo"
        # Missing "question"
    }
    response = client.post("/api/analyze", json=payload)

    assert response.status_code == 422


def test_analyze_invalid_request_missing_dataset():
    payload = {
        "question": "Is there any flood water?"
        # Missing "dataset_id"
    }
    response = client.post("/api/analyze", json=payload)

    assert response.status_code == 422
