"use client";

import { ListMusic } from "lucide-react";
import { AudioEngine } from "@/components/player/audio-engine";
import { ControlButton } from "@/components/player/control-button";
import { NowPlaying } from "@/components/player/now-playing";
import { ProgressLine } from "@/components/player/progress-line";
import { QueuePanel } from "@/components/player/queue-panel";
import { SeekBar } from "@/components/player/seek-bar";
import { TransportControls } from "@/components/player/transport-controls";
import { VolumeControl } from "@/components/player/volume-control";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentSong } from "@/store/selectors/player-selectors";
import { toggleRightPanel } from "@/store/slices/ui-slice";

function DesktopBar() {
	const dispatch = useAppDispatch();
	const song = useAppSelector(selectCurrentSong);
	const queueOpen = useAppSelector((state) => state.ui.rightPanel === "queue");

	return (
		<div className="grid h-[4.5rem] grid-cols-[1fr_minmax(0,40rem)_1fr] items-center gap-4 px-2">
			<div className="min-w-0">{song && <NowPlaying song={song} />}</div>
			<div className="flex min-w-0 flex-col items-center gap-1">
				<TransportControls />
				<SeekBar key={song?.id} fallbackDuration={song?.duration ?? 0} disabled={!song} />
			</div>
			<div className="flex items-center justify-end gap-1">
				<ControlButton
					label={queueOpen ? "Close queue" : "Open queue"}
					aria-pressed={queueOpen}
					active={queueOpen}
					onClick={() => dispatch(toggleRightPanel("queue"))}
				>
					<ListMusic aria-hidden="true" className="size-5" />
				</ControlButton>
				<VolumeControl />
			</div>
		</div>
	);
}

function CompactBar() {
	const song = useAppSelector(selectCurrentSong);
	if (!song) return null;

	return (
		<section
			aria-label={`Now playing: ${song.title}`}
			className="flex flex-col gap-1 rounded-lg bg-surface-highlight p-2"
		>
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0 flex-1">
					<NowPlaying song={song} />
				</div>
				<TransportControls compact />
			</div>
			<ProgressLine key={song.id} fallbackDuration={song.duration} />
		</section>
	);
}

/** Bottom player: full controls from `md` up, compact bar (only while a song is loaded) on phones. */
export function PlayerBar() {
	const isDesktop = useMediaQuery("(min-width: 768px)", true);
	const queueOpen = useAppSelector((state) => state.ui.rightPanel === "queue");

	return (
		<section aria-label="Player" className="shrink-0">
			<AudioEngine />
			{isDesktop ? <DesktopBar /> : <CompactBar />}
			{queueOpen && isDesktop && <QueuePanel />}
		</section>
	);
}
