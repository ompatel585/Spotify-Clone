"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/common/error-fallback";

export default function MainError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <ErrorFallback onRetry={retry} />;
}
