import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
import {KpiCards} from "../kpi-cards";
import {useStats} from "@/hooks/use-stats";

afterEach(cleanup);

vi.mock("@/hooks/use-stats");

const mockUseStats = vi.mocked(useStats);

describe("KpiCards", () => {
	it("shows skeletons when loading", () => {
		mockUseStats.mockReturnValue({
			data: undefined,
			isLoading: true,
		} as ReturnType<typeof useStats>);
		render(<KpiCards/>);
		const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
		expect(skeletons.length).toBe(3);
	});

	it("renders 3 cards with correct values", () => {
		mockUseStats.mockReturnValue({
			data: {
				average_response_time: 320.0,
				average_call_answer_time: 32.0,
				total_incidents: 100,
				average_response_time_by_type: {},
			},
			isLoading: false,
		} as ReturnType<typeof useStats>);
		render(<KpiCards/>);
		expect(screen.getByText("Avg Response Time")).toBeInTheDocument();
		expect(screen.getByText("Avg Call Answer Time")).toBeInTheDocument();
		expect(screen.getByText("Total Incidents")).toBeInTheDocument();
		expect(screen.getByText("05:20")).toBeInTheDocument(); // 320s = 5m 20s
		expect(screen.getByText("32s")).toBeInTheDocument();
		expect(screen.getByText("100")).toBeInTheDocument();
	});

	it("formats response time as mm:ss (713.7s -> 11:54)", () => {
		mockUseStats.mockReturnValue({
			data: {
				average_response_time: 713.7,
				average_call_answer_time: 10,
				total_incidents: 1,
				average_response_time_by_type: {},
			},
			isLoading: false,
		} as ReturnType<typeof useStats>);
		render(<KpiCards/>);
		expect(screen.getByText("11:54")).toBeInTheDocument();
	});
});
