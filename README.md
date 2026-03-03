# RapidSOS Supervisor Dashboard

A full-stack analytical dashboard for 911 center supervisors. Monitors operational metrics, visualizes response time
trends by incident type, and provides a searchable incident data table with AI-generated summaries.

## Tech Stack

| Layer    | Technology                                                             |
|----------|------------------------------------------------------------------------|
| Backend  | Python 3.12, FastAPI, SQLite                                           |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts |
| Data     | TanStack Query (server state), TanStack Table (data table)             |
| Testing  | pytest + httpx (backend), Vitest + Testing Library (frontend)          |
| Package  | pnpm                                                                   |

## Prerequisites

- **Python 3.10+**
- **Node.js 20+** with pnpm (`npm i -g pnpm`)

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python ingest.py           # loads incidents.csv into SQLite
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**.

### 2. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at **http://localhost:3000**.

## Testing

### Backend

```bash
cd backend
.venv/bin/pytest -v
```

### Frontend

```bash
cd frontend
pnpm test run
```

## Project Structure

```
RapidSOS/
├── backend/
│   ├── requirements.txt          # fastapi, uvicorn, pytest, httpx
│   ├── ingest.py                 # CSV → SQLite loader
│   ├── main.py                   # FastAPI endpoints (/stats, /incidents)
│   ├── test_main.py              # API endpoint tests
│   └── test_ingest.py            # Ingestion tests
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout + Providers
│   │   │   ├── page.tsx          # Dashboard page
│   │   │   └── globals.css       # Tailwind + shadcn theme
│   │   ├── components/
│   │   │   ├── providers.tsx     # QueryClient + TooltipProvider
│   │   │   ├── kpi-cards.tsx     # 3 KPI metric cards
│   │   │   ├── response-chart.tsx# Bar chart (shadcn Chart + Recharts)
│   │   │   ├── incidents-table.tsx# Data table (TanStack Table + shadcn)
│   │   │   ├── __tests__/        # Component tests
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── hooks/
│   │   │   ├── use-stats.ts     # useQuery for /stats
│   │   │   └── use-incidents.ts # useQuery for /incidents
│   │   └── lib/
│   │       ├── api.ts           # fetch helpers (getStats, getIncidents)
│   │       ├── types.ts         # Stats, Incident, IncidentsResponse
│   │       ├── query-keys.ts    # centralized TanStack Query keys
│   │       └── __tests__/       # API function tests
│   ├── vitest.config.ts          # Vitest configuration
│   ├── components.json           # shadcn/ui config
│   ├── next.config.ts
│   └── package.json
├── incidents.csv                  # 100 mock incident records
└── README.md
```

## API Endpoints

| Method | Path         | Description                                                                             |
|--------|--------------|-----------------------------------------------------------------------------------------|
| GET    | `/stats`     | Aggregate KPIs: avg response time (global + by type), avg call answer time, total count |
| GET    | `/incidents` | List all incidents. Filter by `?type=Fire`                                              |

### Example: `/stats` response

```json
{
  "average_response_time_by_type": {
    "Fire": 490.6,
    "Medical": 631.8,
    "Police": 829.0,
    "Traffic": 1039.6
  },
  "average_response_time": 713.7,
  "average_call_answer_time": 13.5,
  "total_incidents": 100
}
```

## Frontend Features

- **KPI Cards** — Avg Response Time (MM:SS), Avg Call Answer Time (seconds), Total Incidents. Skeleton loading state.
- **Bar Chart** — Average response time by incident type (Medical, Fire, Police, Traffic). Uses shadcn Chart + Recharts.
  Tooltip with formatted values.
- **Data Table** — Powered by TanStack Table with:
    - Sortable severity column (Critical > High > Medium > Low)
    - Color-coded severity badges (shadcn Badge)
    - Filter by incident type
    - Pagination with page size selector (10/20/50/100)
    - AI Summary tooltip on hover (shadcn Tooltip)
    - Human-readable date/time formatting

## Environment Variables

| Variable              | Default                 | Description          |
|-----------------------|-------------------------|----------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |
