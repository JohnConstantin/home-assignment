"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {TooltipProvider} from "@/components/ui/tooltip";
import {type ReactNode, useState} from "react";

export function Providers({children}: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>{children}</TooltipProvider>
		</QueryClientProvider>
	);
}
