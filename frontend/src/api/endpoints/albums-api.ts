import { baseApi } from "@/api/base-api";
import { toQueryParams } from "@/api/query-params";
import type { Album, AlbumListQuery, AlbumWithTracks, Paginated } from "@/types/contracts";

export const albumsApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		listAlbums: build.query<Paginated<Album>, AlbumListQuery | undefined>({
			query: (params) => ({ url: "/albums", params: toQueryParams(params) }),
			providesTags: (result) => [
				{ type: "Album", id: "LIST" },
				...(result?.items.map(({ id }) => ({ type: "Album" as const, id })) ?? []),
			],
		}),
		getAlbum: build.query<AlbumWithTracks, string>({
			query: (id) => `/albums/${encodeURIComponent(id)}`,
			providesTags: (_result, _error, id) => [{ type: "Album", id }],
		}),
	}),
});

export const { useListAlbumsQuery, useGetAlbumQuery } = albumsApi;
