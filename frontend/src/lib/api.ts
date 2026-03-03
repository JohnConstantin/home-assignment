import type {IncidentsResponse, Stats} from "./types";

const API_BASE =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getStats(): Promise<Stats> {
	const res = await fetch(`${API_BASE}/stats`);
	if (!res.ok) throw new Error("Failed to fetch stats");
	return res.json();
}

export async function getIncidents(): Promise<IncidentsResponse> {
	const res = await fetch(`${API_BASE}/incidents`);
	if (!res.ok) throw new Error("Failed to fetch incidents");
	return res.json();
}
