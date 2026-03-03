"""
FastAPI backend for the RapidSOS Supervisor Dashboard.

Run with:
    uvicorn main:app --reload
"""

import sqlite3
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

DB_PATH = Path(__file__).parent / "incidents.db"

app = FastAPI(title="RapidSOS Supervisor Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ── GET /stats ───────────────────────────────────────────────────────────────


@app.get("/stats")
def stats():
    try:
        conn = get_db()
        cur = conn.cursor()

        # Average response time grouped by incident type
        cur.execute(
            """
            SELECT type, ROUND(AVG(response_time_seconds), 1) AS avg_rt
            FROM incidents
            GROUP BY type
            """
        )
        average_response_time_by_type = {
            row["type"]: row["avg_rt"] for row in cur.fetchall()
        }

        # Global average response time across all incidents
        cur.execute(
            "SELECT ROUND(AVG(response_time_seconds), 1) AS avg_rt FROM incidents"
        )
        average_response_time = cur.fetchone()["avg_rt"]

        # Average call answer time across all incidents
        cur.execute(
            "SELECT ROUND(AVG(call_answer_time_seconds), 1) AS avg_cat FROM incidents"
        )
        average_call_answer_time = cur.fetchone()["avg_cat"]

        # Total incident count
        cur.execute("SELECT COUNT(*) AS cnt FROM incidents")
        total_incidents = cur.fetchone()["cnt"]

        conn.close()

        return {
            "average_response_time_by_type": average_response_time_by_type,
            "average_response_time": average_response_time,
            "average_call_answer_time": average_call_answer_time,
            "total_incidents": total_incidents,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── GET /incidents ───────────────────────────────────────────────────────────


@app.get("/incidents")
def incidents(type: Optional[str] = Query(default=None)):
    try:
        conn = get_db()
        cur = conn.cursor()

        if type:
            cur.execute("SELECT * FROM incidents WHERE type = ?", (type,))
        else:
            cur.execute("SELECT * FROM incidents")

        rows = [dict(row) for row in cur.fetchall()]
        conn.close()

        return {"incidents": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
