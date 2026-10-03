"use client";

import { Music2 } from "lucide-react";
import type { ReactNode } from "react";
import { ErrorFallback } from "@/components/common/error-fallback";
import { CardGrid } from "@/components/music/card-grid";
import { CardSkeleton } from "@/components/music/card-skeleton";
import { SectionHeader } from "@/components/music/section-header";
import { SongCard } from "@/components/music/song-card";
import { EmptyState } from "@/components/ui/empty-state";
import { usePlayCollection } from "@/hooks/use-play-collection";
import type { Song } from "@/types/contracts";
import { getErrorMessage } from "@/utils/errors";

interface SongShelfSectionProps {
	/** Used for the heading id, e.g. "trending" -> "trending-heading". */
	id: string;
	title: string;
	songs: readonly Song[] | undefined;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	onRetry: () => void;
	emptyTitle?: string;
	emptyDescription?: string;
	emptyIcon?: ReactNode;
	/** Render nothing at all (instead of an empty state) once the list turns out to be empty. */
	hideWhenEmpty?: boolean;
	skeletonCount?: number;
}

/** A titled grid of song cards with loading, error and empty states. Playing a card queues the whole shelf. */
export function SongShelfSection({
	id,
	title,
	songs,
	isLoading,
	isError,
	error,
	onRetry,
	emptyTitle = "Nothing here yet",
	emptyDescription,
	emptyIcon = <Music2 />,
	hideWhenEmpty = false,
	skeletonCount = 6,
}: SongShelfSectionProps) {
	const playCollection = usePlayCollection();
	const headingId = `${id}-heading`;
	const isEmpty = songs !== undefined && songs.length === 0;

	if (isEmpty && hideWhenEmpty && !isError) return null;

	return (
		<section aria-labelledby={headingId}>
			<SectionHeader id={headingId} title={title} />
			{isLoading && (
				<CardGrid>
					{Array.from({ length: skeletonCount }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
						<CardSkeleton key={index} />
					))}
				</CardGrid>
			)}
			{isError && <ErrorFallback message={getErrorMessage(error)} onRetry={onRetry} />}
			{!isError && isEmpty && (
				<EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
			)}
			{!isError && songs && songs.length > 0 && (
				<CardGrid>
					{songs.map((song, index) => (
						<SongCard key={song.id} song={song} onPlay={() => playCollection(songs, index)} />
					))}
				</CardGrid>
			)}
		</section>
	);
}
