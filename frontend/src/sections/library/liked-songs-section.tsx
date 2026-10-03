"use client";

import { Heart, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useLikedSongsInfiniteQuery } from "@/api/endpoints/library-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { TrackList } from "@/components/music/track-list";
import { TrackListSkeleton } from "@/components/music/track-list-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/constants/routes";
import { useIsCollectionPlaying, usePlayCollection } from "@/hooks/use-play-collection";
import { getErrorMessage } from "@/utils/errors";

export function LikedSongsSection() {
	const playCollection = usePlayCollection();
	const { data, isLoading, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useLikedSongsInfiniteQuery();
	const songs = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
	const total = data?.pages.at(-1)?.total ?? 0;
	const isPlaying = useIsCollectionPlaying(songs);
	const PlayIcon = isPlaying ? Pause : Play;

	if (isLoading) return <TrackListSkeleton />;
	if (isError && !data) return <ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />;

	if (songs.length === 0) {
		return (
			<EmptyState
				icon={<Heart />}
				title="Songs you like will appear here"
				description="Save songs by tapping the heart icon."
				action={
					<Button asChild>
						<Link href={routes.search}>Find songs</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<section aria-labelledby="liked-songs-heading" className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<Button
					size="icon"
					aria-label={`${isPlaying ? "Pause" : "Play"} Liked Songs`}
					onClick={() => playCollection(songs)}
					className="size-14"
				>
					<PlayIcon aria-hidden="true" className="size-6 fill-current" />
				</Button>
				<div className="min-w-0">
					<h2 id="liked-songs-heading" className="font-bold text-2xl text-foreground tracking-tight">
						Liked Songs
					</h2>
					<p className="text-muted text-sm">{total === 1 ? "1 song" : `${total} songs`}</p>
				</div>
			</div>
			<TrackList songs={songs} label="Liked Songs" />
			{hasNextPage && (
				<div className="flex justify-center">
					<Button variant="outline" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
						Load more
					</Button>
				</div>
			)}
		</section>
	);
}
