"""
Tests for FastAPI endpoints: GET /stats and GET /incidents.
"""

import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import main

# ── Fixture data ─────────────────────────────────────────────────────────────
# 5 rows: all 4 types (EMS, Fire, Police, Traffic), all 4 severities, Fire appears twice.
#
# Hand-calculated expected values (SQLite ROUND(AVG(...), 1)):
#   avg_rt by type: EMS=100.0, Fire=400.0, Police=300.0, Traffic=400.0
#   global avg_rt:  (100+200+300+400+600)/5 = 320.0
#   global avg_cat: (10+20+30+40+60)/5      = 32.0
#   total_incidents: 5

FIXTURE_ROWS = [
    ("t1", "2025-01-01T00:00:00", "EMS", "Critical", 100, 10, "Summary 1"),
    ("t2", "2025-01-02T00:00:00", "Fire", "High", 200, 20, "Summary 2"),
    ("t3", "2025-01-03T00:00:00", "Police", "Medium", 300, 30, "Summary 3"),
    ("t4", "2025-01-04T00:00:00", "Traffic", "Low", 400, 40, "Summary 4"),
    ("t5", "2025-01-05T00:00:00", "Fire", "Critical", 600, 60, "Summary 5"),
]


@pytest.fixture()
def test_db(tmp_path: Path):
    """Create a temporary SQLite DB with known fixture rows."""
    db_path = tmp_path / "test_incidents.db"
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE incidents (
            id                       TEXT PRIMARY KEY,
            timestamp                TEXT,
            type                     TEXT,
            severity                 TEXT,
            response_time_seconds    INTEGER,
            call_answer_time_seconds INTEGER,
            ai_summary               TEXT
        )
        """
    )
    conn.executemany(
        "INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?)",
        FIXTURE_ROWS,
    )
    conn.commit()
    conn.close()
    return db_path


@pytest.fixture()
def client(test_db: Path, monkeypatch: pytest.MonkeyPatch):
    """TestClient with DB_PATH patched to the temporary test DB."""
    monkeypatch.setattr(main, "DB_PATH", test_db)
    return TestClient(main.app)


# ── GET /stats ───────────────────────────────────────────────────────────────


def test_stats_returns_200(client: TestClient):
    resp = client.get("/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert set(data.keys()) == {
        "average_response_time_by_type",
        "average_response_time",
        "average_call_answer_time",
        "total_incidents",
    }


def test_stats_average_response_time_by_type(client: TestClient):
    data = client.get("/stats").json()
    by_type = data["average_response_time_by_type"]
    assert by_type["EMS"] == 100.0
    assert by_type["Fire"] == 400.0
    assert by_type["Police"] == 300.0
    assert by_type["Traffic"] == 400.0


def test_stats_average_response_time(client: TestClient):
    data = client.get("/stats").json()
    assert data["average_response_time"] == 320.0


def test_stats_average_call_answer_time(client: TestClient):
    data = client.get("/stats").json()
    assert data["average_call_answer_time"] == 32.0


def test_stats_total_incidents(client: TestClient):
    data = client.get("/stats").json()
    assert data["total_incidents"] == 5


def test_stats_empty_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """An empty incidents table should return total_incidents=0 and handle nulls."""
    db_path = tmp_path / "empty.db"
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE incidents (
            id                       TEXT PRIMARY KEY,
            timestamp                TEXT,
            type                     TEXT,
            severity                 TEXT,
            response_time_seconds    INTEGER,
            call_answer_time_seconds INTEGER,
            ai_summary               TEXT
        )
        """
    )
    conn.commit()
    conn.close()

    monkeypatch.setattr(main, "DB_PATH", db_path)
    resp = TestClient(main.app).get("/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_incidents"] == 0
    assert data["average_response_time_by_type"] == {}
    assert data["average_response_time"] is None
    assert data["average_call_answer_time"] is None


# ── GET /incidents ───────────────────────────────────────────────────────────


def test_incidents_returns_all(client: TestClient):
    resp = client.get("/incidents")
    assert resp.status_code == 200
    assert len(resp.json()["incidents"]) == 5


def test_incidents_filter_by_type(client: TestClient):
    resp = client.get("/incidents", params={"type": "Fire"})
    incidents = resp.json()["incidents"]
    assert len(incidents) == 2
    assert all(i["type"] == "Fire" for i in incidents)


def test_incidents_filter_nonexistent(client: TestClient):
    resp = client.get("/incidents", params={"type": "Xyz"})
    assert resp.status_code == 200
    assert resp.json()["incidents"] == []


def test_incident_has_all_fields(client: TestClient):
    incidents = client.get("/incidents").json()["incidents"]
    expected_fields = {
        "id",
        "timestamp",
        "type",
        "severity",
        "response_time_seconds",
        "call_answer_time_seconds",
        "ai_summary",
    }
    for incident in incidents:
        assert set(incident.keys()) == expected_fields
