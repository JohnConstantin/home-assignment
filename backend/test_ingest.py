"""
Tests for CSV ingestion (ingest.py).
"""

import sqlite3
import tempfile
from pathlib import Path
from unittest import mock

import pytest

import ingest


@pytest.fixture()
def run_ingest(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Run ingest() with DB_PATH pointed at a temp directory, return the db path."""
    db_path = tmp_path / "test_incidents.db"
    monkeypatch.setattr(ingest, "DB_PATH", db_path)
    ingest.ingest()
    return db_path


def test_ingest_loads_100_rows(run_ingest: Path):
    conn = sqlite3.connect(run_ingest)
    count = conn.execute("SELECT COUNT(*) FROM incidents").fetchone()[0]
    conn.close()
    assert count == 100


def test_ingest_idempotent(run_ingest: Path, monkeypatch: pytest.MonkeyPatch):
    """Running ingest twice should not duplicate rows (INSERT OR REPLACE)."""
    monkeypatch.setattr(ingest, "DB_PATH", run_ingest)
    ingest.ingest()  # second run
    conn = sqlite3.connect(run_ingest)
    count = conn.execute("SELECT COUNT(*) FROM incidents").fetchone()[0]
    conn.close()
    assert count == 100


def test_ingest_columns_not_null(run_ingest: Path):
    conn = sqlite3.connect(run_ingest)
    rows = conn.execute(
        """
        SELECT * FROM incidents
        WHERE id IS NULL
           OR timestamp IS NULL
           OR type IS NULL
           OR severity IS NULL
           OR response_time_seconds IS NULL
           OR call_answer_time_seconds IS NULL
           OR ai_summary IS NULL
        """
    ).fetchall()
    conn.close()
    assert len(rows) == 0, f"Found {len(rows)} rows with NULL values"
