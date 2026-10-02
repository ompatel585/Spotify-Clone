import { Clock } from "lucide-react";
import { TrackRow } from "@/components/music/track-row";
import type { Song } from "@/types/contracts";

interface TrackListProps {
	songs: Song[];
	label: string;
	showCover?: boolean;
	showPlays?: boolean;
	/** Number rows by each song's own track number instead of by position. */
	useTrackNumbers?: boolean;
}

export function TrackList({
	songs,
	label,
	showCover = true,
	showPlays = false,
	useTrackNumbers = false,
}: TrackListProps) {
	return (
		<table aria-label={label} className="w-full table-fixed border-separate border-spacing-0">
			<colgroup>
				<col className="w-12" />
				<col />
				{showPlays && <col className="hidden w-24 md:table-column" />}
				<col className="w-20" />
			</colgroup>
			<thead>
				<tr className="h-9 text-left font-normal text-muted text-sm">
					<th scope="col" className="border-border border-b pl-4 text-center font-normal">
						#
					</th>
					<th scope="col" className="border-border border-b px-4 font-normal">
						Title
					</th>
					{showPlays && (
						<th scope="col" className="hidden border-border border-b text-right font-normal md:table-cell">
							Plays
						</th>
					)}
					<th scope="col" className="border-border border-b pr-4 font-normal">
						<span className="flex justify-end">
							<Clock aria-hidden="true" className="size-4" />
							<span className="sr-only">Duration</span>
						</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{songs.map((song, position) => (
					<TrackRow
						key={song.id}
						song={song}
						index={useTrackNumbers ? (song.trackNumber ?? position + 1) : position + 1}
						showCover={showCover}
						showPlays={showPlays}
					/>
				))}
			</tbody>
		</table>
	);
}
