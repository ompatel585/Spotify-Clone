import { baseApi } from "@/api/base-api";
import type {
	AuthProvidersResponse,
	AuthResponse,
	CurrentUser,
	LoginRequest,
	RegisterRequest,
} from "@/types/contracts";

export const authApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		me: build.query<CurrentUser, void>({
			query: () => "/auth/me",
			providesTags: ["Me"],
		}),
		providers: build.query<AuthProvidersResponse, void>({
			query: () => "/auth/providers",
		}),
		login: build.mutation<AuthResponse, LoginRequest>({
			query: (body) => ({ url: "/auth/login", method: "POST", body }),
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(authApi.util.upsertQueryData("me", undefined, data.user));
				} catch {
					// The form shows the error.
				}
			},
		}),
		register: build.mutation<AuthResponse, RegisterRequest>({
			query: (body) => ({ url: "/auth/register", method: "POST", body }),
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(authApi.util.upsertQueryData("me", undefined, data.user));
				} catch {
					// The form shows the error.
				}
			},
		}),
		logout: build.mutation<void, void>({
			query: () => ({ url: "/auth/logout", method: "POST" }),
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					dispatch(baseApi.util.resetApiState());
				} catch {
					// Keep the session state when the server could not end it.
				}
			},
		}),
		logoutAll: build.mutation<void, void>({
			query: () => ({ url: "/auth/logout-all", method: "POST" }),
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					dispatch(baseApi.util.resetApiState());
				} catch {
					// Keep the session state when the server could not end it.
				}
			},
		}),
	}),
});

export const {
	useMeQuery,
	useProvidersQuery,
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useLogoutAllMutation,
} = authApi;
