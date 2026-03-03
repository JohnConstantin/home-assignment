"use client";

import {useStats} from "@/hooks/use-stats";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

function formatMMSS(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.round(totalSeconds % 60);
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function KpiCards() {
	const {data: stats, isLoading} = useStats();

	const cards = [
		{
			label: "Avg Response Time",
			value: stats ? formatMMSS(stats.average_response_time) : null,
		},
		{
			label: "Avg Call Answer Time",
			value: stats ? `${stats.average_call_answer_time}s` : null,
		},
		{
			label: "Total Incidents",
			value: stats ? String(stats.total_incidents) : null,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{cards.map((card) => (
				<Card key={card.label}>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{card.label}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-9 w-24"/>
						) : (
							<p className="text-3xl font-bold">{card.value}</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
