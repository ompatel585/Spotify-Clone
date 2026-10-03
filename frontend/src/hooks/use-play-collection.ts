"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import {
	isCollectionPlaying,
	isCollectionQueued,
	selectCurrentSong,
} from "@/store/selectors/player-selectors";
import { playQueue, togglePlay } from "@/store/slices/player-slice";
import type { Song } from "@/types/contracts";

/**
 * Start a list of songs. When that same list is already the queue and the requested song is the one loaded,
 * it toggles play/pause instead of restarting.
 */
export function usePlayCollection() {
	const dispatch = useAppDispatch();
	const store = useAppStore();

	return useCallback(
		(songs: readonly Song[], startIndex?: number) => {
			if (songs.length === 0) return;
			const state = store.getState();
			const requested = startIndex === undefined ? undefined : songs[startIndex];
			const current = selectCurrentSong(state);
			const isSameList = isCollectionQueued(
				state,
				songs.map((song) => song.id),
			);
			const targetsCurrent = requested ? requested.id === current?.id : true;
			if (isSameList && current && targetsCurrent) dispatch(togglePlay());
			else dispatch(playQueue({ songs, startIndex }));
		},
		[dispatch, store],
	);
}

/** True while audio is playing and the queue was started from exactly this list. */
export function useIsCollectionPlaying(songs: readonly Song[]): boolean {
	return useAppSelector((state) =>
		isCollectionPlaying(
			state,
			songs.map((song) => song.id),
		),
	);
}
