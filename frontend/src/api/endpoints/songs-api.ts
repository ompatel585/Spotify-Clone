import { baseApi } from "@/api/base-api";
import { toQueryParams } from "@/api/query-params";
import type { Paginated, Song, SongListQuery } from "@/types/contracts";

export const songsApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		listSongs: build.query<Paginated<Song>, SongListQuery | undefined>({
			query: (params) => ({ url: "/songs", params: toQueryParams(params) }),
			providesTags: (result) => [
				{ type: "Song", id: "LIST" },
				...(result?.items.map(({ id }) => ({ type: "Song" as const, id })) ?? []),
			],
		}),
		getSong: build.query<Song, string>({
			query: (id) => `/songs/${encodeURIComponent(id)}`,
			providesTags: (_result, _error, id) => [{ type: "Song", id }],
		}),
	}),
});

export const { useListSongsQuery, useGetSongQuery, useLazyGetSongQuery } = songsApi;
