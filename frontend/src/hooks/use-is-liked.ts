"use client";

import { createSelector } from "@reduxjs/toolkit";
import { libraryApi, useLikedSongIdsQuery } from "@/api/endpoints/library-api";
import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";

const EMPTY_IDS: readonly string[] = [];
const selectLikedIdsResult = libraryApi.endpoints.likedSongIds.select();

/** One Set per id-list response, shared by every row, so each lookup is O(1). */
const selectLikedIdSet = createSelector(
	[(state: RootState) => selectLikedIdsResult(state).data?.songIds ?? EMPTY_IDS],
	(songIds) => new Set(songIds),
);

/** Whether the signed-in user has liked this song. All callers share one cached request. */
export function useIsLiked(songId: string): boolean {
	useLikedSongIdsQuery();
	return useAppSelector((state) => selectLikedIdSet(state).has(songId));
}
