"use client";

import type { ReactNode } from "react";
import { ErrorFallback } from "@/components/common/error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

/**
 * Renders children only for a signed-in user. While the session is being resolved (or the client is being
 * redirected to /login after a dead session) it shows a skeleton, so no signed-out content ever flashes.
 */
export function AuthGate({ children }: { children: ReactNode }) {
	const { user, isLoading, error, refetch } = useAuth();

	if (user) return children;

	// 401 is handled by the reauth query (refresh, or redirect to /login); only other failures surface here.
	const status = typeof error === "object" && error !== null && "status" in error ? error.status : null;
	if (!isLoading && error && status !== 401) {
		return <ErrorFallback onRetry={() => refetch()} />;
	}

	return (
		<div aria-busy="true" className="flex flex-col gap-6 px-6 py-8">
			<Skeleton className="h-9 w-64" />
			<Skeleton className="h-40 w-full max-w-3xl" />
		</div>
	);
}
