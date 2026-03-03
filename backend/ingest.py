"""
Ingest incidents.csv into a local SQLite database.

Usage:
    python ingest.py
"""

import csv
import sqlite3
from pathlib import Path

CSV_PATH = Path(__file__).parent.parent / "incidents.csv"
DB_PATH = Path(__file__).parent / "incidents.db"


def ingest() -> None:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS incidents (
            id                      TEXT PRIMARY KEY,
            timestamp               TEXT,
            type                    TEXT,
            severity                TEXT,
            response_time_seconds   INTEGER,
            call_answer_time_seconds INTEGER,
            ai_summary              TEXT
        )
        """
    )

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            rows.append(
                (
                    row["id"],
                    row["timestamp"],
                    row["type"],
                    row["severity"],
                    int(row["response_time_seconds"]),
                    int(row["call_answer_time_seconds"]),
                    row["ai_summary"],
                )
            )

    cur.executemany(
        """
        INSERT OR REPLACE INTO incidents
            (id, timestamp, type, severity, response_time_seconds,
             call_answer_time_seconds, ai_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )

    conn.commit()
    conn.close()
    print(f"Loaded {len(rows)} rows into {DB_PATH}")


if __name__ == "__main__":
    ingest()
