"""Analysis history persistence.

Uses SQLite for the prototype (zero-config, file-based). The access
pattern is deliberately narrow (save_analysis / list_analyses /
get_analysis) so this can be swapped for PostgreSQL/Supabase later
without touching call sites.
"""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator

from fastapi.encoders import jsonable_encoder

from app.config import get_settings

_SCHEMA = """
CREATE TABLE IF NOT EXISTS analyses (
    analysis_id TEXT PRIMARY KEY,
    task TEXT NOT NULL,
    query TEXT NOT NULL,
    input_files TEXT NOT NULL,
    result_json TEXT NOT NULL,
    confidence REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'complete',
    thumbnail_url TEXT,
    created_at TEXT NOT NULL
);
"""


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    settings = get_settings()
    settings.history_db_full_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(settings.history_db_full_path))
    conn.row_factory = sqlite3.Row
    try:
        conn.execute(_SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def save_analysis(
    analysis_id: str,
    task: str,
    query: str,
    input_files: list[str],
    result: dict[str, Any],
    confidence: float,
    thumbnail_url: str | None = None,
    status: str = "complete",
) -> None:
    # result may contain Pydantic model instances (e.g. EvidenceItem) nested
    # inside plain dicts/lists — jsonable_encoder recursively converts those
    # to plain JSON-safe structures. Without this, json.dumps(..., default=str)
    # would silently stringify each model instead of keeping it as a dict,
    # which breaks anything that later reads result["evidence"][i]["label"]
    # (e.g. report generation) after a round trip through storage.
    safe_result = jsonable_encoder(result)
    with _connect() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO analyses
               (analysis_id, task, query, input_files, result_json, confidence, status, thumbnail_url, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                analysis_id,
                task,
                query,
                json.dumps(input_files),
                json.dumps(safe_result),
                confidence,
                status,
                thumbnail_url,
                datetime.now(timezone.utc).isoformat(),
            ),
        )


def list_analyses(limit: int = 50) -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [_row_to_dict(r) for r in rows]


def get_analysis(analysis_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM analyses WHERE analysis_id = ?", (analysis_id,)).fetchone()
        return _row_to_dict(row) if row else None


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    d["input_files"] = json.loads(d["input_files"])
    d["result"] = json.loads(d.pop("result_json"))
    return d
