"use client";

import { Pause, Play, Shuffle } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useIsCollectionPlaying, usePlayCollection } from "@/hooks/use-play-collection";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleShuffle } from "@/store/slices/player-slice";
import type { AlbumWithTracks } from "@/types/contracts";
import { formatTotalDuration } from "@/utils/format";

/** Long titles get a smaller type size so they stay on a few lines. */
function titleSizeClass(title: string): string {
	if (title.length > 40) return "text-2xl md:text-4xl";
	if (title.length > 20) return "text-3xl md:text-5xl";
	return "text-4xl md:text-7xl";
}

export function AlbumHeroSection({ album }: { album: AlbumWithTracks }) {
	const dispatch = useAppDispatch();
	const playCollection = usePlayCollection();
	const isPlaying = useIsCollectionPlaying(album.songs);
	const shuffle = useAppSelector((state) => state.player.shuffle);
	const songLabel = album.songCount === 1 ? "1 song" : `${album.songCount} songs`;
	const PlayIcon = isPlaying ? Pause : Play;
	const hasSongs = album.songs.length > 0;

	return (
		<section
			aria-labelledby="album-title"
			className="-mt-16 bg-linear-to-b from-primary/25 via-surface-hover/40 to-surface px-4 pt-24 pb-6 md:px-6"
		>
			<div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
				<CoverImage
					src={album.imageUrl}
					alt={`${album.title} cover`}
					sizes="(min-width: 768px) 232px, 192px"
					eager
					className="size-48 shrink-0 rounded-md shadow-2xl shadow-black/60 md:size-58"
				/>
				<div className="flex min-w-0 flex-col gap-2 text-center md:text-left">
					<p className="font-medium text-foreground text-sm">Album</p>
					<h1
						id="album-title"
						className={cn(
							"text-balance break-words font-extrabold text-foreground",
							titleSizeClass(album.title),
						)}
					>
						{album.title}
					</h1>
					<p className="text-muted text-sm">
						<span className="font-bold text-foreground">{album.artist}</span>
						{" • "}
						{album.releaseYear}
						{" • "}
						{songLabel}, {formatTotalDuration(album.totalDuration)}
					</p>
				</div>
			</div>
			{hasSongs && (
				<div className="mt-6 flex items-center justify-center gap-4 md:justify-start">
					<Button
						size="icon"
						aria-label={`${isPlaying ? "Pause" : "Play"} ${album.title}`}
						onClick={() => playCollection(album.songs)}
						className="size-14"
					>
						<PlayIcon aria-hidden="true" className="size-6 fill-current" />
					</Button>
					<IconButton
						aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
						aria-pressed={shuffle}
						onClick={() => dispatch(toggleShuffle())}
						className={cn("size-10 rounded-full", shuffle && "text-primary hover:text-primary-hover")}
					>
						<Shuffle aria-hidden="true" className="size-6" />
					</IconButton>
				</div>
			)}
		</section>
	);
}
