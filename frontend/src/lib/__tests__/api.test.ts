import {beforeEach, describe, expect, it, vi} from "vitest";
import {getIncidents, getStats} from "../api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
	mockFetch.mockReset();
});

describe("getStats", () => {
	it("fetches the correct URL", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		});
		await getStats();
		expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/stats");
	});

	it("returns parsed JSON", async () => {
		const payload = {
			average_response_time_by_type: {Fire: 400},
			average_response_time: 320,
			average_call_answer_time: 32,
			total_incidents: 5,
		};
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => payload,
		});
		const result = await getStats();
		expect(result).toEqual(payload);
	});

	it("throws on error response", async () => {
		mockFetch.mockResolvedValueOnce({ok: false, status: 500});
		await expect(getStats()).rejects.toThrow("Failed to fetch stats");
	});
});

describe("getIncidents", () => {
	it("fetches the correct URL", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({incidents: []}),
		});
		await getIncidents();
		expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/incidents");
	});

	it("throws on error response", async () => {
		mockFetch.mockResolvedValueOnce({ok: false, status: 500});
		await expect(getIncidents()).rejects.toThrow("Failed to fetch incidents");
	});
});
