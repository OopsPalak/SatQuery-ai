"""Regression test for a real bug found during manual smoke-testing:
saving an analysis result (which contains Pydantic EvidenceItem instances
nested in a plain dict) to SQLite history and then generating a report from
the reloaded record used to raise TypeError, because json.dumps(...,
default=str) stringified each EvidenceItem instead of keeping it as a dict.
"""
from __future__ import annotations


def test_analyze_then_report_round_trip(client, sample_png_bytes):
    upload_resp = client.post(
        "/api/upload",
        files={"file": ("scene_urban.png", sample_png_bytes, "image/png")},
    )
    assert upload_resp.status_code == 200
    file_id = upload_resp.json()["file_id"]

    analyze_resp = client.post(
        "/api/analyze",
        json={"file_ids": [file_id], "query": "Describe the land cover in this scene.", "mode": "auto"},
    )
    assert analyze_resp.status_code == 200
    analysis_id = analyze_resp.json()["analysis_id"]
    assert len(analyze_resp.json()["evidence"]) > 0

    # This is the step that previously raised a 500 due to the serialization bug.
    report_resp = client.post(f"/api/reports/{analysis_id}")
    assert report_resp.status_code == 200
    body = report_resp.json()
    assert "report_url" in body

    history_resp = client.get(f"/api/history/{analysis_id}")
    assert history_resp.status_code == 200
    # Evidence must have round-tripped as real objects, not stringified reprs.
    stored_evidence = history_resp.json()["result"]["evidence"]
    assert isinstance(stored_evidence[0], dict)
    assert "label" in stored_evidence[0]
