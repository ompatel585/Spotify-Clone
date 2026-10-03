"use client";

import { useEffect } from "react";
import { SEEK_STEP_SECONDS } from "@/constants/player";
import { useAudioElement } from "@/hooks/use-audio-element";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { selectCurrentSong } from "@/store/selectors/player-selectors";
import { next, pause, play, previous } from "@/store/slices/player-slice";

/** OS-level media controls, lock-screen metadata and artwork. */
export function useMediaSession() {
	const audio = useAudioElement();
	const dispatch = useAppDispatch();
	const store = useAppStore();
	const song = useAppSelector(selectCurrentSong);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);

	useEffect(() => {
		if (!("mediaSession" in navigator)) return;
		navigator.mediaSession.metadata = song
			? new MediaMetadata({
					title: song.title,
					artist: song.artist,
					album: song.albumTitle ?? "",
					artwork: [{ src: song.imageUrl }],
				})
			: null;
	}, [song]);

	useEffect(() => {
		if (!("mediaSession" in navigator)) return;
		navigator.mediaSession.playbackState = song ? (isPlaying ? "playing" : "paused") : "none";
	}, [song, isPlaying]);

	useEffect(() => {
		if (!audio || !("mediaSession" in navigator)) return;
		const session = navigator.mediaSession;
		const seekTo = (seconds: number) => {
			const limit = Number.isFinite(audio.duration) ? audio.duration : seconds;
			audio.currentTime = Math.min(Math.max(0, seconds), limit);
		};

		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			["play", () => dispatch(play())],
			["pause", () => dispatch(pause())],
			["previoustrack", () => dispatch(previous(audio.currentTime))],
			["nexttrack", () => dispatch(next())],
			["seekto", (details) => seekTo(details.seekTime ?? 0)],
			["seekbackward", (details) => seekTo(audio.currentTime - (details.seekOffset ?? SEEK_STEP_SECONDS))],
			["seekforward", (details) => seekTo(audio.currentTime + (details.seekOffset ?? SEEK_STEP_SECONDS))],
		];
		for (const [action, handler] of handlers) {
			try {
				session.setActionHandler(action, handler);
			} catch {
				// Not every browser supports every action.
			}
		}

		const updatePosition = () => {
			if (store.getState().player.queue.length === 0) return;
			if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
			try {
				session.setPositionState({
					duration: audio.duration,
					playbackRate: audio.playbackRate,
					position: Math.min(audio.currentTime, audio.duration),
				});
			} catch {
				// Invalid state while metadata is loading; the next event fixes it.
			}
		};
		const events = ["loadedmetadata", "durationchange", "seeked", "play", "pause", "ratechange"] as const;
		for (const name of events) audio.addEventListener(name, updatePosition);

		return () => {
			for (const name of events) audio.removeEventListener(name, updatePosition);
			for (const [action] of handlers) {
				try {
					session.setActionHandler(action, null);
				} catch {
					// Ignored, see above.
				}
			}
		};
	}, [audio, dispatch, store]);
}
