import { baseApi } from "@/api/base-api";
import { toQueryParams } from "@/api/query-params";
import type { RecentlyPlayedItem, RecordPlayRequest } from "@/types/contracts";

export const playsApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		/** Fire and forget: it invalidates nothing, so no visible query refetches because a song was played. */
		recordPlay: build.mutation<void, RecordPlayRequest>({
			query: (body) => ({ url: "/plays", method: "POST", body }),
		}),
		recentPlays: build.query<RecentlyPlayedItem[], { limit?: number } | undefined>({
			query: (params) => ({ url: "/plays/recent", params: toQueryParams(params) }),
		}),
	}),
});

export const { useRecordPlayMutation, useRecentPlaysQuery } = playsApi;
