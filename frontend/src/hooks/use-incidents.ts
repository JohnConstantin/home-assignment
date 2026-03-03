import {useQuery} from "@tanstack/react-query";
import {getIncidents} from "@/lib/api";
import {queryKeys} from "@/lib/query-keys";

export function useIncidents() {
	return useQuery({queryKey: queryKeys.incidents, queryFn: getIncidents});
}
