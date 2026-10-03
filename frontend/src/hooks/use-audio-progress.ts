"use client";

import { useEffect, useState } from "react";
import { useAudioElement } from "@/hooks/use-audio-element";

interface AudioProgress {
	currentTime: number;
	duration: number;
}

/**
 * Playback position for the seek bar. It lives in local state on purpose: it changes about four times a second
 * and must never reach Redux. Only the component calling this re-renders.
 */
export function useAudioProgress(fallbackDuration: number): AudioProgress {
	const audio = useAudioElement();
	const [progress, setProgress] = useState<AudioProgress>({ currentTime: 0, duration: fallbackDuration });

	useEffect(() => {
		if (!audio) return;
		const read = () => {
			const duration =
				Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDuration;
			setProgress((previous) =>
				previous.currentTime === audio.currentTime && previous.duration === duration
					? previous
					: { currentTime: audio.currentTime, duration },
			);
		};
		const events = ["timeupdate", "seeked", "loadedmetadata", "durationchange", "emptied"] as const;
		for (const name of events) audio.addEventListener(name, read);
		read();
		return () => {
			for (const name of events) audio.removeEventListener(name, read);
		};
	}, [audio, fallbackDuration]);

	return progress;
}
