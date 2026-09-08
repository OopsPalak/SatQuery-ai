def test_upload_valid_png(client, sample_png_bytes):
    resp = client.post(
        "/api/upload",
        files={"file": ("scene_urban.png", sample_png_bytes, "image/png")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["validation"]["valid"] is True
    assert body["format"] == "PNG"
    assert body["width"] == 64 and body["height"] == 64
    assert "file_id" in body


def test_upload_rejects_bad_extension(client):
    resp = client.post(
        "/api/upload",
        files={"file": ("payload.exe", b"not-an-image", "application/octet-stream")},
    )
    assert resp.status_code == 422
    body = resp.json()
    assert body["error"] is True
    assert body["code"] == "UNSUPPORTED_FILE"


def test_metadata_lookup_after_upload(client, sample_png_bytes):
    upload_resp = client.post(
        "/api/upload",
        files={"file": ("scene_agri.png", sample_png_bytes, "image/png")},
    )
    file_id = upload_resp.json()["file_id"]
    meta_resp = client.get(f"/api/upload/{file_id}/metadata")
    assert meta_resp.status_code == 200
    assert meta_resp.json()["file_id"] == file_id


def test_metadata_not_found(client):
    resp = client.get("/api/upload/does-not-exist/metadata")
    assert resp.status_code == 404
    assert resp.json()["code"] == "FILE_NOT_FOUND"
