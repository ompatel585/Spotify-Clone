"use client";

import Link from "next/link";
import { CoverImage } from "@/components/common/cover-image";
import { PlayButton } from "@/components/music/play-button";
import { routes } from "@/constants/routes";
import { usePlayCollection } from "@/hooks/use-play-collection";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { isSongCurrent, isSongPlaying } from "@/store/selectors/player-selectors";
import { pause } from "@/store/slices/player-slice";
import type { Song } from "@/types/contracts";

const cardClass =
	"group relative flex flex-col gap-3 rounded-lg bg-surface-elevated p-3 transition-colors has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-primary hover:bg-surface-hover focus-within:bg-surface-hover";

interface SongCardProps {
	song: Song;
	/** Starts playback; defaults to playing just this song. Lists pass their own to queue the whole list. */
	onPlay?: () => void;
}

export function SongCard({ song, onPlay }: SongCardProps) {
	const dispatch = useAppDispatch();
	const playCollection = usePlayCollection();
	const isCurrent = useAppSelector((state) => isSongCurrent(state, song.id));
	const isPlaying = useAppSelector((state) => isSongPlaying(state, song.id));
	const title = <p className="truncate font-bold text-foreground text-sm">{song.title}</p>;

	return (
		<div className={cardClass}>
			<div className="relative">
				<CoverImage
					src={song.imageUrl}
					alt={`${song.title} cover`}
					sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 45vw"
					className="rounded-md shadow-lg"
				/>
				<PlayButton
					subject={song.title}
					isPlaying={isPlaying}
					isCurrent={isCurrent}
					onClick={() => {
						if (isPlaying) dispatch(pause());
						else if (onPlay) onPlay();
						else playCollection([song], 0);
					}}
					className="absolute right-2 bottom-2 z-10"
				/>
			</div>
			<div className="min-w-0">
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
				<p className="truncate text-muted text-sm">{song.artist}</p>
			</div>
		</div>
	);
}
