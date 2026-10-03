"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAudioElement } from "@/hooks/use-audio-element";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useMediaSession } from "@/hooks/use-media-session";
import { usePlayTracking } from "@/hooks/use-play-tracking";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { loadPlayerPreferences } from "@/store/listeners/persistence-listeners";
import { selectCurrentSong } from "@/store/selectors/player-selectors";
import { hydratePreferences, next, pause, restartCurrent } from "@/store/slices/player-slice";

/** `play()` can be rejected by the autoplay policy. Only that flips the state back; aborts and load errors are handled elsewhere. */
function startPlayback(audio: HTMLAudioElement, onBlocked: () => void) {
	audio.play().catch((error: unknown) => {
		if (error instanceof DOMException && error.name === "NotAllowedError") onBlocked();
	});
}

/**
 * Renderless bridge between Redux and the single audio element: Redux decides what should be playing, this
 * makes the element do it and reports back what happened (ended, failed, blocked by autoplay policy).
 */
export function AudioEngine() {
	const audio = useAudioElement();
	const dispatch = useAppDispatch();
	const store = useAppStore();
	const song = useAppSelector(selectCurrentSong);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const playId = useAppSelector((state) => state.player.playId);
	const volume = useAppSelector((state) => state.player.volume);
	const muted = useAppSelector((state) => state.player.muted);

	useKeyboardShortcuts();
	useMediaSession();
	usePlayTracking();
	useDocumentTitle();

	// Saved preferences are applied after mount, so the server and first client render agree.
	useEffect(() => {
		const saved = loadPlayerPreferences();
		if (saved) dispatch(hydratePreferences(saved));
	}, [dispatch]);

	useEffect(() => {
		if (!audio) return;
		audio.volume = volume;
		audio.muted = muted;
	}, [audio, volume, muted]);

	const songId = song?.id;
	const audioUrl = song?.audioUrl;

	// A track was selected or restarted. What was already applied is remembered on the element itself, so a
	// remount of the engine (for example a shell swap) does not restart the song that is playing.
	useEffect(() => {
		if (!audio) return;
		if (audio.dataset.playId === String(playId)) return;
		audio.dataset.playId = String(playId);

		if (!songId || !audioUrl) {
			audio.pause();
			delete audio.dataset.songId;
			audio.removeAttribute("src");
			audio.load();
			return;
		}
		if (audio.dataset.songId !== songId) {
			audio.dataset.songId = songId;
			audio.src = audioUrl;
		} else {
			audio.currentTime = 0;
		}
		if (store.getState().player.isPlaying) startPlayback(audio, () => dispatch(pause()));
	}, [audio, playId, songId, audioUrl, store, dispatch]);

	useEffect(() => {
		if (!audio) return;
		if (!audio.dataset.songId) return;
		if (!isPlaying) {
			audio.pause();
		} else if (audio.ended) {
			dispatch(restartCurrent());
		} else {
			startPlayback(audio, () => dispatch(pause()));
		}
	}, [audio, isPlaying, dispatch]);

	useEffect(() => {
		if (!audio) return;
		let failures = 0;

		const onEnded = () => {
			if (store.getState().player.repeat === "one") dispatch(restartCurrent());
			else dispatch(next());
		};
		const onPlaying = () => {
			failures = 0;
		};
		// Headphones unplugged, an OS media key or the browser UI paused the element behind our back.
		const onPause = () => {
			if (!audio.ended && audio.readyState > 0 && store.getState().player.isPlaying) dispatch(pause());
		};
		const onError = () => {
			if (!audio.getAttribute("src")) return;
			const { queue, currentIndex } = store.getState().player;
			const failed = queue[currentIndex];
			failures += 1;
			toast.error(failed ? `Could not play "${failed.title}"` : "Could not play this track");
			// Every track in a row failing means the queue is unplayable: stop instead of looping forever.
			if (failures >= queue.length) dispatch(pause());
			else dispatch(next());
		};

		audio.addEventListener("ended", onEnded);
		audio.addEventListener("playing", onPlaying);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("error", onError);
		return () => {
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("playing", onPlaying);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("error", onError);
		};
	}, [audio, store, dispatch]);

	return null;
}
