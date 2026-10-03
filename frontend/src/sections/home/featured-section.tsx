"use client";

import { Music2 } from "lucide-react";
import { useFeaturedSongsQuery } from "@/api/endpoints/discovery-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { FeaturedTile } from "@/components/music/featured-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayCollection } from "@/hooks/use-play-collection";
import { FEATURED_SIZE } from "@/types/contracts";
import { getErrorMessage } from "@/utils/errors";

const GRID_CLASS = "grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 xl:grid-cols-3";

export function FeaturedSection() {
	const playCollection = usePlayCollection();
	const { data, isLoading, isError, error, refetch } = useFeaturedSongsQuery();

	return (
		<section aria-labelledby="featured-heading">
			<h2 id="featured-heading" className="sr-only">
				Featured
			</h2>
			{isLoading && (
				<div className={GRID_CLASS}>
					{Array.from({ length: FEATURED_SIZE }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
						<Skeleton key={index} className="h-16 rounded-md" />
					))}
				</div>
			)}
			{isError && <ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />}
			{data && data.length === 0 && <EmptyState icon={<Music2 />} title="Nothing featured yet" />}
			{data && data.length > 0 && (
				<div className={GRID_CLASS}>
					{data.map((song, index) => (
						// The tiles are the first thing on the page, so their covers load eagerly.
						<FeaturedTile key={song.id} song={song} eager onPlay={() => playCollection(data, index)} />
					))}
				</div>
			)}
		</section>
	);
}
