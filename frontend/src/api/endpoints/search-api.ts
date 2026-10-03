import { baseApi } from "@/api/base-api";
import { toQueryParams } from "@/api/query-params";
import type { SearchQuery, SearchResults } from "@/types/contracts";

export const searchApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		/** Callers must skip an empty `q`: the API rejects it with 400. */
		search: build.query<SearchResults, SearchQuery>({
			query: (params) => ({ url: "/search", params: toQueryParams(params) }),
			providesTags: [{ type: "Song", id: "LIST" }],
			keepUnusedDataFor: 120,
		}),
	}),
});

export const { useSearchQuery } = searchApi;
