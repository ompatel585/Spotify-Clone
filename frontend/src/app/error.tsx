"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/common/error-fallback";

export default function RouteError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-screen items-center justify-center">
			<ErrorFallback onRetry={retry} />
		</main>
	);
}
