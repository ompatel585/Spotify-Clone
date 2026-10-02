"use client";

import { Music2 } from "lucide-react";
import { useListSongsQuery } from "@/api/endpoints/songs-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { CardGrid } from "@/components/music/card-grid";
import { CardSkeleton } from "@/components/music/card-skeleton";
import { SectionHeader } from "@/components/music/section-header";
import { SongCard } from "@/components/music/song-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getErrorMessage } from "@/utils/errors";

export function NewReleasesSection() {
	const { data, isLoading, isError, error, refetch } = useListSongsQuery({ sort: "newest", limit: 8 });

	return (
		<section aria-labelledby="new-releases-heading">
			<SectionHeader id="new-releases-heading" title="New releases" />
			{isLoading && (
				<CardGrid>
					{Array.from({ length: 6 }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
						<CardSkeleton key={index} />
					))}
				</CardGrid>
			)}
			{isError && <ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />}
			{data && data.items.length === 0 && <EmptyState icon={<Music2 />} title="Nothing here yet" />}
			{data && data.items.length > 0 && (
				<CardGrid>
					{data.items.map((song) => (
						<SongCard key={song.id} song={song} />
					))}
				</CardGrid>
			)}
		</section>
	);
}
