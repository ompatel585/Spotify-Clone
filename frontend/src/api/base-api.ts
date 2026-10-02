import { createApi } from "@reduxjs/toolkit/query/react";
import { reauthBaseQuery } from "@/api/reauth-base-query";
import { tagTypes } from "@/api/tags";

export interface HealthResponse {
	status: string;
	uptime: number;
	db: string;
}

/** Root API. Domain slices attach their endpoints with `baseApi.injectEndpoints`. */
export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: reauthBaseQuery,
	tagTypes,
	endpoints: (build) => ({
		health: build.query<HealthResponse, void>({
			query: () => "/health",
		}),
	}),
});

export const { useHealthQuery } = baseApi;
