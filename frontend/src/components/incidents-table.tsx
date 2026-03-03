"use client";

import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,} from "lucide-react";

import {useIncidents} from "@/hooks/use-incidents";
import type {Incident} from "@/lib/types";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";
import {Tooltip, TooltipContent, TooltipTrigger,} from "@/components/ui/tooltip";

const SEVERITY_ORDER: Record<string, number> = {
	Critical: 0,
	High: 1,
	Medium: 2,
	Low: 3,
};

function severityVariant(
	severity: string,
): "destructive" | "default" | "secondary" | "outline" {
	switch (severity) {
		case "Critical":
			return "destructive";
		case "High":
			return "default";
		case "Medium":
			return "secondary";
		case "Low":
			return "outline";
		default:
			return "outline";
	}
}

const columns: ColumnDef<Incident>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({row}) => (
			<span className="font-mono text-xs text-muted-foreground">
        {(row.getValue("id") as string).slice(0, 8)}
      </span>
		),
	},
	{
		accessorKey: "timestamp",
		header: "Date & Time",
		cell: ({row}) => {
			const raw = row.getValue("timestamp") as string;
			const date = new Date(raw);
			return (
				<span className="whitespace-nowrap">
          {date.toLocaleDateString("en-US", {
	          month: "short",
	          day: "numeric",
	          year: "numeric",
          })}{" "}
					{date.toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
						hour12: true,
					})}
        </span>
			);
		},
	},
	{
		accessorKey: "type",
		header: "Type",
	},
	{
		accessorKey: "severity",
		header: ({column}) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Severity
				<ArrowUpDown className="ml-1 h-4 w-4"/>
			</Button>
		),
		cell: ({row}) => {
			const severity = row.getValue("severity") as string;
			return <Badge variant={severityVariant(severity)}>{severity}</Badge>;
		},
		sortingFn: (rowA, rowB) => {
			const a = SEVERITY_ORDER[rowA.getValue("severity") as string] ?? 99;
			const b = SEVERITY_ORDER[rowB.getValue("severity") as string] ?? 99;
			return a - b;
		},
	},
	{
		accessorKey: "response_time_seconds",
		header: "Response Time (s)",
	},
	{
		accessorKey: "call_answer_time_seconds",
		header: "Call Answer Time (s)",
	},
	{
		accessorKey: "ai_summary",
		header: "AI Summary",
		cell: ({row}) => {
			const summary = row.getValue("ai_summary") as string;
			return (
				<Tooltip>
					<TooltipTrigger asChild>
            <span className="block max-w-[260px] cursor-help truncate">
              {summary}
            </span>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="max-w-sm text-sm">
						{summary}
					</TooltipContent>
				</Tooltip>
			);
		},
	},
];

export function IncidentsTable() {
	const {data, isLoading} = useIncidents();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const table = useReactTable({
		data: data?.incidents ?? [],
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {sorting, columnFilters},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Incidents</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="pb-4">
					<Input
						placeholder="Filter by type..."
						value={
							(table.getColumn("type")?.getFilterValue() as string) ?? ""
						}
						onChange={(e) =>
							table.getColumn("type")?.setFilterValue(e.target.value)
						}
						className="max-w-sm"
					/>
				</div>

				<div className="overflow-hidden rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({length: 10}).map((_, i) => (
									<TableRow key={i}>
										{columns.map((_, j) => (
											<TableCell key={j}>
												<Skeleton className="h-4 w-full"/>
											</TableCell>
										))}
									</TableRow>
								))
							) : table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				<div className="flex items-center justify-between py-4">
					<div className="flex items-center gap-2">
						<p className="text-sm text-muted-foreground">Rows per page</p>
						<Select
							value={String(table.getState().pagination.pageSize)}
							onValueChange={(value) => table.setPageSize(Number(value))}
						>
							<SelectTrigger className="w-[70px]">
								<SelectValue/>
							</SelectTrigger>
							<SelectContent>
								{[10, 20, 50, 100].map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm text-muted-foreground">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</p>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronsLeft className="h-4 w-4"/>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4"/>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ChevronRight className="h-4 w-4"/>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<ChevronsRight className="h-4 w-4"/>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
