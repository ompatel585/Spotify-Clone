"use client";

import { useEffect } from "react";
import { useRecordPlayMutation } from "@/api/endpoints/plays-api";
import { useAudioElement } from "@/hooks/use-audio-element";
import { useAppStore } from "@/store/hooks";
import { selectCurrentSong } from "@/store/selectors/player-selectors";
import { PLAY_THRESHOLD_RATIO, PLAY_THRESHOLD_SECONDS } from "@/types/contracts";

/** Gaps between `timeupdate` events longer than this are seeks, not listening time. */
const MAX_LISTEN_STEP_SECONDS = 2;

/**
 * Reports one play per playback once the listener has actually heard the threshold (30 s or half the track,
 * whichever comes first). Seeking forward does not count, and a restart (repeat one) starts a new count.
 */
export function usePlayTracking() {
	const audio = useAudioElement();
	const store = useAppStore();
	const [recordPlay] = useRecordPlayMutation();

	useEffect(() => {
		if (!audio) return;
		let trackedPlayId = -1;
		let listened = 0;
		let lastTime = 0;
		let reported = false;

		const onTimeUpdate = () => {
			const state = store.getState();
			if (state.player.playId !== trackedPlayId) {
				trackedPlayId = state.player.playId;
				listened = 0;
				lastTime = audio.currentTime;
				reported = false;
				return;
			}
			const delta = audio.currentTime - lastTime;
			lastTime = audio.currentTime;
			if (reported || audio.paused || delta <= 0 || delta > MAX_LISTEN_STEP_SECONDS) return;
			listened += delta;

			const song = selectCurrentSong(state);
			if (!song) return;
			const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : song.duration;
			if (listened >= Math.min(PLAY_THRESHOLD_SECONDS, PLAY_THRESHOLD_RATIO * duration)) {
				reported = true;
				// Failures are silent on purpose: a missed play must never interrupt the music.
				void recordPlay({ songId: song.id });
			}
		};

		audio.addEventListener("timeupdate", onTimeUpdate);
		return () => audio.removeEventListener("timeupdate", onTimeUpdate);
	}, [audio, store, recordPlay]);
}
