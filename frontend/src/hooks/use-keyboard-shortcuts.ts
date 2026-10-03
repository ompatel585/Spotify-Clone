"use client";

import { useEffect } from "react";
import { SHORTCUTS } from "@/constants/keyboard-shortcuts";
import { SEEK_STEP_SECONDS, VOLUME_STEP } from "@/constants/player";
import { useAudioElement } from "@/hooks/use-audio-element";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import {
	cycleRepeat,
	next,
	previous,
	setVolume,
	toggleMute,
	togglePlay,
	toggleShuffle,
} from "@/store/slices/player-slice";

/** Typing, menus, dialogs and widgets that already own the key must keep it. */
const OWNS_KEYBOARD =
	'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"], [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="combobox"], [role="textbox"]';
/** Space activates these natively, so it must not also toggle playback. */
const ACTIVATES_ON_SPACE =
	'button, a[href], summary, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], [role="checkbox"]';

const roundVolume = (value: number) => Math.round(value * 100) / 100;

export function useKeyboardShortcuts() {
	const audio = useAudioElement();
	const dispatch = useAppDispatch();
	const store = useAppStore();

	useEffect(() => {
		if (!audio) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
			const action = SHORTCUTS[event.key.toLowerCase()];
			if (!action) return;
			const target = event.target instanceof Element ? event.target : null;
			if (target?.closest(OWNS_KEYBOARD)) return;
			if (action === "togglePlay" && target?.closest(ACTIVATES_ON_SPACE)) return;

			const { player } = store.getState();
			if (player.queue.length === 0) return;
			event.preventDefault();

			switch (action) {
				case "togglePlay":
					dispatch(togglePlay());
					break;
				case "seekBackward":
					audio.currentTime = Math.max(0, audio.currentTime - SEEK_STEP_SECONDS);
					break;
				case "seekForward": {
					const limit = Number.isFinite(audio.duration) ? audio.duration : Number.POSITIVE_INFINITY;
					audio.currentTime = Math.min(limit, audio.currentTime + SEEK_STEP_SECONDS);
					break;
				}
				case "volumeUp":
					dispatch(setVolume(roundVolume(player.volume + VOLUME_STEP)));
					break;
				case "volumeDown":
					dispatch(setVolume(roundVolume(player.volume - VOLUME_STEP)));
					break;
				case "toggleMute":
					dispatch(toggleMute());
					break;
				case "toggleShuffle":
					dispatch(toggleShuffle());
					break;
				case "cycleRepeat":
					dispatch(cycleRepeat());
					break;
				case "next":
					dispatch(next());
					break;
				case "previous":
					dispatch(previous(audio.currentTime));
					break;
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [audio, dispatch, store]);
}
