"use client";

import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { ControlButton } from "@/components/player/control-button";
import { useAudioElement } from "@/hooks/use-audio-element";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentSong, selectHasNext } from "@/store/selectors/player-selectors";
import { cycleRepeat, next, previous, togglePlay, toggleShuffle } from "@/store/slices/player-slice";
import type { RepeatMode } from "@/types/player.types";

const REPEAT_LABELS: Record<RepeatMode, string> = {
	off: "Repeat: off",
	all: "Repeat: all",
	one: "Repeat: one",
};

/** `compact` shows only play/pause, for the mobile bar. */
export function TransportControls({ compact = false }: { compact?: boolean }) {
	const dispatch = useAppDispatch();
	const audio = useAudioElement();
	const hasSong = useAppSelector((state) => selectCurrentSong(state) !== null);
	const hasNext = useAppSelector(selectHasNext);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const shuffle = useAppSelector((state) => state.player.shuffle);
	const repeat = useAppSelector((state) => state.player.repeat);
	const PlayIcon = isPlaying ? Pause : Play;

	const playPause = (
		<ControlButton
			label={isPlaying ? "Pause" : "Play"}
			disabled={!hasSong}
			onClick={() => dispatch(togglePlay())}
			className="size-10 bg-foreground text-background hover:scale-105 hover:bg-foreground hover:text-background"
		>
			<PlayIcon aria-hidden="true" className="size-5 fill-current" />
		</ControlButton>
	);
	if (compact) return playPause;

	return (
		<div className="flex items-center gap-2">
			<ControlButton
				label={shuffle ? "Disable shuffle" : "Enable shuffle"}
				aria-pressed={shuffle}
				active={shuffle}
				onClick={() => dispatch(toggleShuffle())}
			>
				<Shuffle aria-hidden="true" className="size-4" />
			</ControlButton>
			<ControlButton
				label="Previous"
				disabled={!hasSong}
				onClick={() => dispatch(previous(audio?.currentTime ?? 0))}
			>
				<SkipBack aria-hidden="true" className="size-5 fill-current" />
			</ControlButton>
			{playPause}
			<ControlButton label="Next" disabled={!hasNext} onClick={() => dispatch(next())}>
				<SkipForward aria-hidden="true" className="size-5 fill-current" />
			</ControlButton>
			<ControlButton
				label={REPEAT_LABELS[repeat]}
				aria-pressed={repeat === "off" ? false : repeat === "all" ? true : "mixed"}
				active={repeat !== "off"}
				onClick={() => dispatch(cycleRepeat())}
			>
				{repeat === "one" ? (
					<Repeat1 aria-hidden="true" className="size-4" />
				) : (
					<Repeat aria-hidden="true" className="size-4" />
				)}
			</ControlButton>
		</div>
	);
}
