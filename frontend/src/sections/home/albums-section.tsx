"use client";

import { Disc3 } from "lucide-react";
import { useListAlbumsQuery } from "@/api/endpoints/albums-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { AlbumCard } from "@/components/music/album-card";
import { CardGrid } from "@/components/music/card-grid";
import { CardSkeleton } from "@/components/music/card-skeleton";
import { SectionHeader } from "@/components/music/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getErrorMessage } from "@/utils/errors";

export function AlbumsSection() {
	const { data, isLoading, isError, error, refetch } = useListAlbumsQuery({ limit: 12 });

	return (
		<section aria-labelledby="albums-heading">
			<SectionHeader id="albums-heading" title="Albums" />
			{isLoading && (
				<CardGrid>
					{Array.from({ length: 6 }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
						<CardSkeleton key={index} />
					))}
				</CardGrid>
			)}
			{isError && <ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />}
			{data && data.items.length === 0 && <EmptyState icon={<Disc3 />} title="Nothing here yet" />}
			{data && data.items.length > 0 && (
				<CardGrid>
					{data.items.map((album, index) => (
						// The first row is above the fold on desktop, so it is the largest contentful paint.
						<AlbumCard key={album.id} album={album} eager={index < 6} />
					))}
				</CardGrid>
			)}
		</section>
	);
}
