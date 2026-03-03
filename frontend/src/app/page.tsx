import {KpiCards} from "@/components/kpi-cards";
import {ResponseChart} from "@/components/response-chart";
import {IncidentsTable} from "@/components/incidents-table";

export default function Home() {
	return (
		<main className="mx-auto max-w-7xl space-y-6 p-6">
			<h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
			<KpiCards/>
			<ResponseChart/>
			<IncidentsTable/>
		</main>
	);
}
