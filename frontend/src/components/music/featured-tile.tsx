"use client";

import Link from "next/link";
import { CoverImage } from "@/components/common/cover-image";
import { PlayButton } from "@/components/music/play-button";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { isSongCurrent, isSongPlaying } from "@/store/selectors/player-selectors";
import { pause } from "@/store/slices/player-slice";
import type { Song } from "@/types/contracts";

interface FeaturedTileProps {
	song: Song;
	onPlay: () => void;
	eager?: boolean;
}

/** Compact horizontal tile (cover, title, hover play button) for the top-of-home grid. */
export function FeaturedTile({ song, onPlay, eager = false }: FeaturedTileProps) {
	const dispatch = useAppDispatch();
	const isCurrent = useAppSelector((state) => isSongCurrent(state, song.id));
	const isPlaying = useAppSelector((state) => isSongPlaying(state, song.id));
	const title = (
		<p
			className={cn(
				"truncate font-bold text-sm md:text-base",
				isCurrent ? "text-primary" : "text-foreground",
			)}
		>
			{song.title}
		</p>
	);

	return (
		<div className="group relative flex h-16 items-center gap-3 overflow-hidden rounded-md bg-surface-highlight pr-2 transition-colors focus-within:bg-surface-hover hover:bg-surface-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-primary">
			<CoverImage
				src={song.imageUrl}
				alt={`${song.title} cover`}
				sizes="64px"
				eager={eager}
				className="size-16 shrink-0 shadow-black/40 shadow-lg"
			/>
			<div className="min-w-0 flex-1">
				{song.albumId ? (
					<Link
						href={routes.album(song.albumId)}
						aria-label={`${song.title} by ${song.artist}${song.albumTitle ? `, from ${song.albumTitle}` : ""}`}
						className="block outline-none after:absolute after:inset-0 after:content-['']"
					>
						{title}
					</Link>
				) : (
					title
				)}
				<p className="truncate text-muted text-xs">{song.artist}</p>
			</div>
			<PlayButton
				subject={song.title}
				isPlaying={isPlaying}
				isCurrent={isCurrent}
				onClick={() => (isPlaying ? dispatch(pause()) : onPlay())}
				className="relative z-10 size-10 translate-y-0"
			/>
		</div>
	);
}
