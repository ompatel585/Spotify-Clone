import { CoverImage } from "@/components/common/cover-image";
import { cn } from "@/lib/cn";
import type { Song } from "@/types/contracts";
import { formatCompactNumber, formatDuration } from "@/utils/format";

interface TrackRowProps {
	song: Song;
	/** Number shown in the first column. */
	index: number;
	showCover: boolean;
	showPlays: boolean;
}

const cellClass = "py-2 first:rounded-l-md last:rounded-r-md";

export function TrackRow({ song, index, showCover, showPlays }: TrackRowProps) {
	return (
		<tr
			tabIndex={0}
			className="group h-14 text-muted text-sm transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:-outline-offset-2"
		>
			<td className={cn(cellClass, "pl-4 text-center tabular-nums")}>{index}</td>
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
						<p className="truncate font-medium text-base text-foreground">{song.title}</p>
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
