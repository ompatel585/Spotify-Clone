"use client";

import { useAudioProgress } from "@/hooks/use-audio-progress";

/** Thin non-interactive progress line for the compact mobile bar. */
export function ProgressLine({ fallbackDuration }: { fallbackDuration: number }) {
	const { currentTime, duration } = useAudioProgress(fallbackDuration);
	const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

	return (
		<div aria-hidden="true" className="h-0.5 overflow-hidden rounded-full bg-subtle/50">
			<div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
		</div>
	);
}
