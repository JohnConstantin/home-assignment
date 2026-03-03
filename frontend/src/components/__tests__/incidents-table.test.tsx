import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {IncidentsTable} from "../incidents-table";
import {TooltipProvider} from "@/components/ui/tooltip";
import {useIncidents} from "@/hooks/use-incidents";

afterEach(cleanup);

vi.mock("@/hooks/use-incidents");

const mockUseIncidents = vi.mocked(useIncidents);

function renderTable() {
	return render(
		<TooltipProvider>
			<IncidentsTable/>
		</TooltipProvider>,
	);
}

const MOCK_INCIDENTS = [
	{
		id: "aaaaaaaa-1111-2222-3333-444444444444",
		timestamp: "2025-01-01T15:45:00",
		type: "Fire",
		severity: "Critical",
		response_time_seconds: 300,
		call_answer_time_seconds: 15,
		ai_summary: "House fire reported",
	},
	{
		id: "bbbbbbbb-1111-2222-3333-444444444444",
		timestamp: "2025-01-02T10:30:00",
		type: "EMS",
		severity: "Low",
		response_time_seconds: 120,
		call_answer_time_seconds: 8,
		ai_summary: "Minor injury at park",
	},
];

describe("IncidentsTable", () => {
	it("shows skeleton rows when loading", () => {
		mockUseIncidents.mockReturnValue({
			data: undefined,
			isLoading: true,
		} as ReturnType<typeof useIncidents>);
		renderTable();
		const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it("renders incident rows", () => {
		mockUseIncidents.mockReturnValue({
			data: {incidents: MOCK_INCIDENTS},
			isLoading: false,
		} as ReturnType<typeof useIncidents>);
		renderTable();
		expect(screen.getByText("Fire")).toBeInTheDocument();
		expect(screen.getByText("EMS")).toBeInTheDocument();
	});

	it("severity badges: Critical=destructive, Low=outline", () => {
		mockUseIncidents.mockReturnValue({
			data: {incidents: MOCK_INCIDENTS},
			isLoading: false,
		} as ReturnType<typeof useIncidents>);
		renderTable();

		// Use getAllByText since Radix tooltips may render content in portals
		const criticalBadges = screen.getAllByText("Critical");
		const criticalBadge = criticalBadges[0].closest(
			"[data-slot='badge']",
		);
		expect(criticalBadge).toHaveAttribute("data-variant", "destructive");

		const lowBadges = screen.getAllByText("Low");
		const lowBadge = lowBadges[0].closest("[data-slot='badge']");
		expect(lowBadge).toHaveAttribute("data-variant", "outline");
	});

	it("formats date correctly", () => {
		mockUseIncidents.mockReturnValue({
			data: {
				incidents: [MOCK_INCIDENTS[0]],
			},
			isLoading: false,
		} as ReturnType<typeof useIncidents>);
		renderTable();
		// The component uses toLocaleDateString("en-US") + toLocaleTimeString("en-US")
		// Check for key date parts present in the rendered table
		const table = screen.getByRole("table");
		expect(table.textContent).toMatch(/Jan/);
		expect(table.textContent).toMatch(/2025/);
	});

	it("shows empty state when no data", () => {
		mockUseIncidents.mockReturnValue({
			data: {incidents: []},
			isLoading: false,
		} as ReturnType<typeof useIncidents>);
		renderTable();
		expect(screen.getByText("No results.")).toBeInTheDocument();
	});

	it("filters by type", async () => {
		mockUseIncidents.mockReturnValue({
			data: {incidents: MOCK_INCIDENTS},
			isLoading: false,
		} as ReturnType<typeof useIncidents>);
		renderTable();

		const filterInputs = screen.getAllByPlaceholderText("Filter by type...");
		await userEvent.type(filterInputs[0], "Fire");

		expect(screen.getByText("Fire")).toBeInTheDocument();
		expect(screen.queryByText("EMS")).not.toBeInTheDocument();
	});
});
