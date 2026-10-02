"use client";

import { useHealthQuery } from "@/api/base-api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ApiStatus() {
	const { data, isLoading, isError } = useHealthQuery();

	if (isLoading) return <Skeleton className="h-6 w-28 rounded-full" />;
	if (isError || !data) return <Badge variant="danger">API unreachable</Badge>;
	if (data.status === "ok") return <Badge variant="success">API up · db {data.db}</Badge>;
	return <Badge variant="warning">API degraded · db {data.db}</Badge>;
}
