import { baseApi } from "@/api/base-api";
import { toQueryParams } from "@/api/query-params";
import type { RecentlyPlayedItem, RecordPlayRequest } from "@/types/contracts";

const recentPlaysTag = { type: "Library" as const, id: "RECENT" };

export const playsApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		/**
		 * Fire and forget. On success only the listening history (and the picks based on it) go stale, so a
		 * recently-played list is fresh the next time it is shown; song and album queries are left alone.
		 */
		recordPlay: build.mutation<void, RecordPlayRequest>({
			query: (body) => ({ url: "/plays", method: "POST", body }),
			invalidatesTags: (_result, error) => (error ? [] : [recentPlaysTag]),
		}),
		recentPlays: build.query<RecentlyPlayedItem[], { limit?: number } | undefined>({
			query: (params) => ({ url: "/plays/recent", params: toQueryParams(params) }),
			providesTags: [recentPlaysTag],
		}),
	}),
});

export const { useRecordPlayMutation, useRecentPlaysQuery } = playsApi;
