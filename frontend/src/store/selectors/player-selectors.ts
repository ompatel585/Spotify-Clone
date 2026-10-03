import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { Song } from "@/types/contracts";

const selectQueue = (state: RootState) => state.player.queue;
const selectCurrentIndex = (state: RootState) => state.player.currentIndex;

export const selectCurrentSong = (state: RootState): Song | null =>
	state.player.queue[state.player.currentIndex] ?? null;

export const selectHasNext = (state: RootState) =>
	state.player.queue.length > 0 &&
	(state.player.currentIndex < state.player.queue.length - 1 || state.player.repeat === "all");

/** Songs after the current one. Memoized so the queue panel only re-renders when they change. */
export const selectUpNext = createSelector([selectQueue, selectCurrentIndex], (queue, index) =>
	queue.slice(index + 1),
);

export const isSongCurrent = (state: RootState, songId: string) => selectCurrentSong(state)?.id === songId;

/** The song is the current one and audio is playing. */
export const isSongPlaying = (state: RootState, songId: string) =>
	state.player.isPlaying && isSongCurrent(state, songId);

/** The queue was started from exactly this list of songs (natural order). */
export const isCollectionQueued = (state: RootState, songIds: readonly string[]): boolean => {
	const original = state.player.originalQueue;
	return original.length === songIds.length && original.every((song, index) => song.id === songIds[index]);
};

export const isCollectionPlaying = (state: RootState, songIds: readonly string[]) =>
	state.player.isPlaying && isCollectionQueued(state, songIds);

/** Audio is playing a song of this album (for cards that only know the album id). */
export const isAlbumPlaying = (state: RootState, albumId: string) =>
	state.player.isPlaying && selectCurrentSong(state)?.albumId === albumId;
