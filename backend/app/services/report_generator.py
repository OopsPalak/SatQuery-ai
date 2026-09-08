"""Generates a downloadable analysis report.

Produces a self-contained HTML report (opens in any browser, and can be
printed/saved to PDF by the user or a headless-Chrome step later) styled
to match the frontend's dark mission-control aesthetic. If `weasyprint` is
installed, a true PDF is generated instead — this is optional and
gracefully degrades to HTML when unavailable, keeping report generation
dependency-light.
"""
from __future__ import annotations

from pathlib import Path

from app.config import get_settings

_TEMPLATE = """<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>SatQuery AI — Analysis Report</title>
<style>
  body {{ background:#0b0e13; color:#e5e9f0; font-family: 'Space Grotesk', Arial, sans-serif; padding: 40px; }}
  h1 {{ color:#5fd4e0; font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase; }}
  .meta {{ color:#8b93a5; font-size: 12px; margin-bottom: 24px; }}
  .section {{ margin-bottom: 20px; }}
  .label {{ color:#8b93a5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }}
  .value {{ font-size: 14px; line-height: 1.5; }}
  .evidence {{ display:inline-block; border:1px solid #232c3a; border-radius: 999px; padding: 4px 12px; margin: 2px; font-size: 12px; }}
  .confidence {{ font-size: 28px; font-weight: 600; color:#4fd48a; }}
</style>
</head>
<body>
  <h1>SatQuery AI · Remote Sensing Analysis Report</h1>
  <div class="meta">Generated {timestamp}</div>

  <div class="section">
    <div class="label">Analysis ID</div>
    <div class="value">{analysis_id}</div>
  </div>
  <div class="section">
    <div class="label">Query</div>
    <div class="value">{query}</div>
  </div>
  <div class="section">
    <div class="label">Task</div>
    <div class="value">{task}</div>
  </div>
  <div class="section">
    <div class="label">Model / Tool Selection</div>
    <div class="value">{model_used}</div>
  </div>
  <div class="section">
    <div class="label">AI Findings</div>
    <div class="value">{answer}</div>
  </div>
  <div class="section">
    <div class="label">Confidence</div>
    <div class="confidence">{confidence_pct}%</div>
  </div>
  <div class="section">
    <div class="label">Visual Evidence</div>
    <div class="value">{evidence_html}</div>
  </div>
  <div class="section">
    <div class="label">Execution Summary</div>
    <div class="value">{trace_html}</div>
  </div>
</body>
</html>
"""


def generate_report(analysis: dict) -> Path:
    settings = get_settings()
    out_dir = settings.result_path / analysis["analysis_id"]
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "report.html"

    evidence_html = "".join(
        f'<span class="evidence">{e["label"]} · {e["confidence"]:.0%}</span>' for e in analysis.get("evidence", [])
    )
    trace_html = "<br/>".join(
        f'{s["step"]}. {s["name"]} — {s.get("details") or s["status"]}' for s in analysis.get("execution_trace", [])
    )

    html = _TEMPLATE.format(
        timestamp=analysis.get("timestamp", ""),
        analysis_id=analysis.get("analysis_id", ""),
        query=analysis.get("query", ""),
        task=str(analysis.get("task", "")).replace("_", " ").title(),
        model_used=analysis.get("model_used", ""),
        answer=analysis.get("answer", ""),
        confidence_pct=round(float(analysis.get("confidence", 0)) * 100, 1),
        evidence_html=evidence_html or "<em>No structured evidence returned.</em>",
        trace_html=trace_html or "<em>No execution trace available.</em>",
    )
    out_path.write_text(html)

    try:
        from weasyprint import HTML  # type: ignore

        pdf_path = out_dir / "report.pdf"
        HTML(string=html).write_pdf(str(pdf_path))
        return pdf_path
    except Exception:  # noqa: BLE001 - weasyprint not installed or failed; HTML report still works
        return out_path
