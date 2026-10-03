"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useAudioElement } from "@/hooks/use-audio-element";
import { useAudioProgress } from "@/hooks/use-audio-progress";
import { formatDuration } from "@/utils/format";

interface SeekBarProps {
	/** Length in seconds from the song record, used until the audio reports its own. */
	fallbackDuration: number;
	disabled?: boolean;
}

/** Owns its own progress state, so the per-tick re-renders stop at this component. */
export function SeekBar({ fallbackDuration, disabled = false }: SeekBarProps) {
	const audio = useAudioElement();
	const { currentTime, duration } = useAudioProgress(fallbackDuration);
	const [dragValue, setDragValue] = useState<number | null>(null);
	const shown = Math.min(dragValue ?? currentTime, duration);
	const label = `${formatDuration(shown)} of ${formatDuration(duration)}`;

	return (
		<div className="flex w-full items-center gap-2 text-muted text-xs tabular-nums">
			<span className="w-10 text-right">{formatDuration(shown)}</span>
			<Slider
				thumbLabel="Seek"
				valueText={label}
				value={[shown]}
				min={0}
				max={Math.max(duration, 1)}
				step={1}
				disabled={disabled}
				onValueChange={([value]) => setDragValue(value ?? 0)}
				onValueCommit={([value]) => {
					if (audio && value !== undefined) audio.currentTime = value;
					setDragValue(null);
				}}
			/>
			<span className="w-10">{formatDuration(duration)}</span>
		</div>
	);
}
