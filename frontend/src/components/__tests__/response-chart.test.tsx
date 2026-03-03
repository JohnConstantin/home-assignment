import React from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
import {ResponseChart} from "../response-chart";
import {useStats} from "@/hooks/use-stats";

afterEach(cleanup);

interface ChartItem {
	type: string;
	avgResponseTime: number;
}

// Mock recharts — jsdom cannot handle SVG measurements
vi.mock("recharts", () => ({
	ResponsiveContainer: ({children}: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	BarChart: ({
		           children,
		           data,
	           }: {
		children: React.ReactNode;
		data?: ChartItem[];
	}) => (
		<div data-testid="bar-chart">
			{data?.map((d, i) => (
				<span key={i} data-testid={`bar-item-${d.type}`}>
          {d.type}:{d.avgResponseTime}
        </span>
			))}
			{children}
		</div>
	),
	Bar: () => <div/>,
	CartesianGrid: () => <div/>,
	XAxis: () => <div/>,
	YAxis: () => <div/>,
	Tooltip: () => <div/>,
	Legend: () => <div/>,
}));

vi.mock("@/hooks/use-stats");

const mockUseStats = vi.mocked(useStats);

describe("ResponseChart", () => {
	it("shows skeleton when loading", () => {
		mockUseStats.mockReturnValue({
			data: undefined,
			isLoading: true,
		} as ReturnType<typeof useStats>);
		render(<ResponseChart/>);
		const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
		expect(skeletons.length).toBeGreaterThanOrEqual(1);
	});

	it("renders chart title", () => {
		mockUseStats.mockReturnValue({
			data: {
				average_response_time_by_type: {Fire: 400, EMS: 100},
				average_response_time: 250,
				average_call_answer_time: 30,
				total_incidents: 2,
			},
			isLoading: false,
		} as ReturnType<typeof useStats>);
		render(<ResponseChart/>);
		expect(
			screen.getByText("Average Response Time by Incident Type"),
		).toBeInTheDocument();
	});

	it("transforms data for chart (Object entries -> array with type + avgResponseTime)", () => {
		mockUseStats.mockReturnValue({
			data: {
				average_response_time_by_type: {Fire: 400, EMS: 100, Police: 300},
				average_response_time: 266.7,
				average_call_answer_time: 30,
				total_incidents: 3,
			},
			isLoading: false,
		} as ReturnType<typeof useStats>);
		render(<ResponseChart/>);
		expect(screen.getByTestId("bar-item-Fire")).toHaveTextContent("Fire:400");
		expect(screen.getByTestId("bar-item-EMS")).toHaveTextContent("EMS:100");
		expect(screen.getByTestId("bar-item-Police")).toHaveTextContent(
			"Police:300",
		);
	});
});
