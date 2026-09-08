def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "service" in body


def test_system_status(client):
    resp = client.get("/api/system/status")
    assert resp.status_code == 200
    body = resp.json()
    assert body["backend"] == "online"
