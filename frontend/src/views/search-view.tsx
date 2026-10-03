"use client";

import { SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useEffectEvent, useRef, useState } from "react";
import { useSearchQuery } from "@/api/endpoints/search-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { SearchInput } from "@/components/music/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/constants/routes";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/cn";
import { BrowseSection } from "@/sections/search/browse-section";
import { SearchResultsSection } from "@/sections/search/search-results-section";
import { pickTopResult, TopResultSection } from "@/sections/search/top-result-section";
import { SEARCH_MAX_LENGTH } from "@/types/contracts";
import { getErrorMessage } from "@/utils/errors";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 10;

function cleanQuery(value: string): string {
	return value.trim().slice(0, SEARCH_MAX_LENGTH);
}

function searchHref(query: string): string {
	return query ? `${routes.search}?q=${encodeURIComponent(query)}` : routes.search;
}

function SearchResultsSkeleton() {
	return (
		<div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-56 w-full rounded-lg" />
			</div>
			<div className="flex flex-col gap-4">
				<Skeleton className="h-8 w-24" />
				{Array.from({ length: 4 }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
					<div key={index} className="flex items-center gap-3">
						<Skeleton className="size-10 shrink-0 rounded-sm" />
						<div className="flex flex-1 flex-col gap-2">
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-3 w-1/3" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/** Search page. The query lives in `?q=` (bookmarkable); typing updates it with `replace`, so history stays clean. */
export function SearchView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const urlQuery = cleanQuery(searchParams.get("q") ?? "");
	const [input, setInput] = useState(urlQuery);
	const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
	const debouncedQuery = useDebounce(cleanQuery(input), SEARCH_DEBOUNCE_MS);
	const inputRef = useRef<HTMLInputElement>(null);

	// The URL changed from outside (an artist link, back/forward): adopt it unless it is the one we just wrote.
	if (urlQuery !== syncedUrlQuery) {
		setSyncedUrlQuery(urlQuery);
		if (urlQuery !== debouncedQuery) setInput(urlQuery);
	}

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Only a settled change of the typed text writes the URL. Reading the URL in an effect event (not as a
	// dependency) keeps an external URL change from being overwritten by the still-old debounced text.
	const writeUrl = useEffectEvent((query: string) => {
		if (query !== urlQuery) router.replace(searchHref(query), { scroll: false });
	});
	useEffect(() => {
		writeUrl(debouncedQuery);
	}, [debouncedQuery]);

	// Enter (or a URL that already matches the box) searches right away; clearing the box shows Browse at once.
	const typedQuery = cleanQuery(input);
	const activeQuery = typedQuery === "" || typedQuery === urlQuery ? typedQuery : debouncedQuery;
	const { data, currentData, isFetching, isError, error, refetch } = useSearchQuery(
		{ q: activeQuery, limit: SEARCH_LIMIT },
		{ skip: !activeQuery },
	);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (typedQuery !== urlQuery) router.replace(searchHref(typedQuery), { scroll: false });
	};

	const results = activeQuery ? (currentData ?? data) : undefined;
	const isStale = Boolean(activeQuery) && isFetching && !currentData;
	const hasResults =
		results && (results.songs.length > 0 || results.albums.length > 0 || results.artists.length > 0);
	const topResult = results ? pickTopResult(results) : null;

	return (
		<div className="flex flex-col gap-8 px-4 pt-4 pb-8 md:px-6">
			<h1 className="sr-only">Search</h1>
			<search className="max-w-xl">
				<form onSubmit={handleSubmit}>
					<SearchInput
						ref={inputRef}
						value={input}
						onValueChange={setInput}
						aria-label="Search"
						placeholder="What do you want to listen to?"
					/>
				</form>
			</search>

			{!activeQuery && <BrowseSection />}

			{activeQuery && isError && !isFetching && (
				<ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />
			)}

			{activeQuery && !isError && !results && <SearchResultsSkeleton />}

			{activeQuery && !isError && results && (
				<div aria-busy={isStale || undefined} className={cn("transition-opacity", isStale && "opacity-60")}>
					{hasResults ? (
						<SearchResultsSection
							results={results}
							topResult={topResult && <TopResultSection result={topResult} />}
						/>
					) : (
						<EmptyState
							icon={<SearchX />}
							title={`No results found for “${results.query}”`}
							description="Check the spelling, or try fewer or different keywords."
						/>
					)}
				</div>
			)}

			<p aria-live="polite" className="sr-only">
				{activeQuery && results && !isStale
					? hasResults
						? `Results for ${results.query}`
						: `No results found for ${results.query}`
					: ""}
			</p>
		</div>
	);
}
