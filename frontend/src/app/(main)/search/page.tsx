import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchView } from "@/views/search-view";

export const metadata: Metadata = { title: "Search" };

/** Shown while `?q=` is read on the client (the view uses `useSearchParams`, which needs a Suspense boundary). */
function SearchFallback() {
	return (
		<div aria-busy="true" className="flex flex-col gap-8 px-4 pt-4 pb-8 md:px-6">
			<Skeleton className="h-12 w-full max-w-xl rounded-full" />
			<Skeleton className="h-8 w-40" />
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense fallback={<SearchFallback />}>
			<SearchView />
		</Suspense>
	);
}
