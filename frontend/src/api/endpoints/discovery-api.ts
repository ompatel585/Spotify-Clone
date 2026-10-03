import { baseApi } from "@/api/base-api";
import { toQueryParams } from "@/api/query-params";
import type { Song } from "@/types/contracts";

type LimitQuery = { limit?: number } | undefined;

const songListTags = [{ type: "Song" as const, id: "LIST" }];

export const discoveryApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		featuredSongs: build.query<Song[], void>({
			query: () => "/discovery/featured",
			providesTags: songListTags,
		}),
		newReleases: build.query<Song[], LimitQuery>({
			query: (params) => ({ url: "/discovery/new-releases", params: toQueryParams(params) }),
			providesTags: songListTags,
		}),
		trendingSongs: build.query<Song[], LimitQuery>({
			query: (params) => ({ url: "/discovery/trending", params: toQueryParams(params) }),
			providesTags: songListTags,
		}),
		/** Personalized for the signed-in user (top artists from their plays), with a generic fallback. */
		madeForYou: build.query<Song[], LimitQuery>({
			query: (params) => ({ url: "/discovery/made-for-you", params: toQueryParams(params) }),
			providesTags: songListTags,
		}),
	}),
});

export const { useFeaturedSongsQuery, useNewReleasesQuery, useTrendingSongsQuery, useMadeForYouQuery } =
	discoveryApi;
