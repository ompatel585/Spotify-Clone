import { toast } from "sonner";
import { baseApi } from "@/api/base-api";
import type { LikedSongIdsResponse, Paginated, Song } from "@/types/contracts";

export const LIKED_SONGS_PAGE_SIZE = 50;

/** Identifies the song being (un)liked; the title is only used for the failure toast. */
export interface LikeSongArgs {
	songId: string;
	title: string;
}

const likedListTag = { type: "Library" as const, id: "LIKES" };

/** Queries are injected first so the mutations below can patch their cache with full types. */
const libraryQueriesApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		likedSongIds: build.query<LikedSongIdsResponse, void>({
			query: () => "/library/likes/ids",
			providesTags: [{ type: "Library", id: "IDS" }],
		}),
		likedSongs: build.infiniteQuery<Paginated<Song>, void, number>({
			infiniteQueryOptions: {
				initialPageParam: 1,
				getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
			},
			query: ({ pageParam }) => ({
				url: "/library/likes",
				params: { page: pageParam, limit: LIKED_SONGS_PAGE_SIZE },
			}),
			providesTags: [likedListTag],
		}),
	}),
});

/** Adds or removes the id in the cached id list (a no-op until that list has been loaded). */
function setLikedInCache(songId: string, liked: boolean) {
	return libraryQueriesApi.util.updateQueryData("likedSongIds", undefined, (draft) => {
		const has = draft.songIds.includes(songId);
		if (liked && !has) draft.songIds.unshift(songId);
		if (!liked && has) draft.songIds = draft.songIds.filter((id) => id !== songId);
	});
}

/** Puts the optimistic change back, with a toast, when the request fails. */
async function rollbackOnFailure(
	queryFulfilled: Promise<unknown>,
	patch: { undo: () => void },
	message: string,
) {
	try {
		await queryFulfilled;
	} catch {
		patch.undo();
		toast.error(message);
	}
}

export const libraryApi = libraryQueriesApi.injectEndpoints({
	endpoints: (build) => ({
		likeSong: build.mutation<void, LikeSongArgs>({
			query: ({ songId }) => ({ url: `/library/likes/${encodeURIComponent(songId)}`, method: "PUT" }),
			onQueryStarted: ({ songId, title }, { dispatch, queryFulfilled }) =>
				rollbackOnFailure(
					queryFulfilled,
					dispatch(setLikedInCache(songId, true)),
					`Could not save "${title}" to Liked Songs`,
				),
			invalidatesTags: (_result, error) => (error ? [] : [likedListTag]),
		}),
		unlikeSong: build.mutation<void, LikeSongArgs>({
			query: ({ songId }) => ({ url: `/library/likes/${encodeURIComponent(songId)}`, method: "DELETE" }),
			onQueryStarted: ({ songId, title }, { dispatch, queryFulfilled }) =>
				rollbackOnFailure(
					queryFulfilled,
					dispatch(setLikedInCache(songId, false)),
					`Could not remove "${title}" from Liked Songs`,
				),
			invalidatesTags: (_result, error) => (error ? [] : [likedListTag]),
		}),
	}),
});

export const {
	useLikedSongIdsQuery,
	useLikedSongsInfiniteQuery,
	useLikeSongMutation,
	useUnlikeSongMutation,
} = libraryApi;
