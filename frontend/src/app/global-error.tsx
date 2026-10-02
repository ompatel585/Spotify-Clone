"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/common/error-fallback";
import { inter } from "@/lib/fonts";
import "@/styles/globals.css";

export default function GlobalError({
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
		<html lang="en" className={`dark ${inter.variable}`}>
			<body>
				<title>Something went wrong | Spotify</title>
				<main className="flex min-h-screen items-center justify-center">
					<ErrorFallback onRetry={retry} />
				</main>
			</body>
		</html>
	);
}
