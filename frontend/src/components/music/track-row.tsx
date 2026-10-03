"use client";

import { Pause, Play } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { EqualizerIcon } from "@/components/music/equalizer-icon";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { isSongCurrent, isSongPlaying } from "@/store/selectors/player-selectors";
import { pause } from "@/store/slices/player-slice";
import type { Song } from "@/types/contracts";
import { formatCompactNumber, formatDuration } from "@/utils/format";

interface TrackRowProps {
	song: Song;
	/** Number shown in the first column. */
	index: number;
	showCover: boolean;
	showPlays: boolean;
	/** Start playing from this row. */
	onPlay: () => void;
}

const cellClass = "py-2 first:rounded-l-md last:rounded-r-md";

export function TrackRow({ song, index, showCover, showPlays, onPlay }: TrackRowProps) {
	const dispatch = useAppDispatch();
	const isCurrent = useAppSelector((state) => isSongCurrent(state, song.id));
	const isPlaying = useAppSelector((state) => isSongPlaying(state, song.id));
	const ActionIcon = isPlaying ? Pause : Play;

	return (
		// The button in the first cell is the keyboard and screen-reader way to play; the row click is a mouse shortcut.
		<tr
			onClick={() => (isPlaying ? dispatch(pause()) : onPlay())}
			className="group h-14 cursor-default text-muted text-sm transition-colors hover:bg-surface-hover has-[button:focus-visible]:bg-surface-hover"
		>
			<td className={cn(cellClass, "pl-4 text-center tabular-nums")}>
				<button
					type="button"
					aria-label={`${isPlaying ? "Pause" : "Play"} ${song.title}`}
					className="mx-auto flex size-8 items-center justify-center rounded-full focus-visible:outline-offset-0"
				>
					<span className="group-focus-within:hidden group-hover:hidden">
						{isPlaying ? <EqualizerIcon /> : <span className={cn(isCurrent && "text-primary")}>{index}</span>}
					</span>
					<ActionIcon
						aria-hidden="true"
						className="hidden size-4 fill-current text-foreground group-focus-within:block group-hover:block"
					/>
				</button>
			</td>
			<td className={cn(cellClass, "px-4")}>
				<div className="flex min-w-0 items-center gap-3">
					{showCover && (
						<CoverImage
							src={song.imageUrl}
							alt={`${song.title} cover`}
							sizes="40px"
							className="size-10 shrink-0 rounded-sm"
						/>
					)}
					<div className="min-w-0">
						<p
							className={cn("truncate font-medium text-base", isCurrent ? "text-primary" : "text-foreground")}
						>
							{song.title}
						</p>
						<p className="truncate">{song.artist}</p>
					</div>
				</div>
			</td>
			{showPlays && (
				<td className={cn(cellClass, "hidden text-right tabular-nums md:table-cell")}>
					{formatCompactNumber(song.playCount)}
				</td>
			)}
			<td className={cn(cellClass, "pr-4 text-right tabular-nums")}>{formatDuration(song.duration)}</td>
		</tr>
	);
}
