"use client";

import {useStats} from "@/hooks/use-stats";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";
import {Skeleton} from "@/components/ui/skeleton";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";

const chartConfig = {
	avgResponseTime: {
		label: "Avg Response Time (s)",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig;

export function ResponseChart() {
	const {data: stats, isLoading} = useStats();

	const chartData = stats
		? Object.entries(stats.average_response_time_by_type).map(
			([type, avgResponseTime]) => ({type, avgResponseTime}),
		)
		: [];

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Average Response Time by Incident Type</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-50 w-full"/>
				) : (
					<ChartContainer config={chartConfig} className="h-50 w-full">
						<BarChart
							accessibilityLayer
							data={chartData}
							margin={{top: 8, right: 8, bottom: 0, left: 8}}
						>
							<CartesianGrid vertical={false}/>
							<XAxis
								dataKey="type"
								tickLine={false}
								tickMargin={8}
								axisLine={false}
								fontSize={12}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								fontSize={12}
								width={40}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value) => (
											<div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          Avg Response Time
                        </span>
												<span className="font-mono font-medium">
                          {Number(value).toFixed(1)}s
                        </span>
											</div>
										)}
									/>
								}
								cursor={{fill: "hsl(var(--muted))"}}
							/>
							<Bar
								dataKey="avgResponseTime"
								fill="var(--color-avgResponseTime)"
								radius={[4, 4, 0, 0]}
								maxBarSize={60}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
