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

interface AlbumsSectionProps {
	/** Used for the heading id, e.g. "albums" -> "albums-heading". */
	id?: string;
	title?: string;
	limit?: number;
	/** Above-the-fold grids load their first row of covers eagerly. */
	eagerCount?: number;
}

export function AlbumsSection({
	id = "albums",
	title = "Albums",
	limit = 12,
	eagerCount = 0,
}: AlbumsSectionProps) {
	const { data, isLoading, isError, error, refetch } = useListAlbumsQuery({ limit });
	const headingId = `${id}-heading`;

	return (
		<section aria-labelledby={headingId}>
			<SectionHeader id={headingId} title={title} />
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
						<AlbumCard key={album.id} album={album} eager={index < eagerCount} />
					))}
				</CardGrid>
			)}
		</section>
	);
}
