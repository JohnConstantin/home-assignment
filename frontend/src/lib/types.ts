export interface Stats {
	average_response_time_by_type: Record<string, number>;
	average_response_time: number;
	average_call_answer_time: number;
	total_incidents: number;
}

export interface Incident {
	id: string;
	timestamp: string;
	type: string;
	severity: string;
	response_time_seconds: number;
	call_answer_time_seconds: number;
	ai_summary: string;
}

export interface IncidentsResponse {
	incidents: Incident[];
}
