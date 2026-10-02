import { baseApi } from "@/api/base-api";
import { authApi } from "@/api/endpoints/auth-api";
import type {
	CurrentUser,
	Paginated,
	PublicUser,
	UpdateProfileRequest,
	UserListQuery,
} from "@/types/contracts";

export const usersApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		updateProfile: build.mutation<CurrentUser, UpdateProfileRequest>({
			query: (body) => ({ url: "/users/me", method: "PATCH", body }),
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(authApi.util.upsertQueryData("me", undefined, data));
				} catch {
					// The caller shows the error.
				}
			},
			invalidatesTags: ["User"],
		}),
		listUsers: build.query<Paginated<PublicUser>, UserListQuery | undefined>({
			query: (params) => ({ url: "/users", params: params }),
			providesTags: ["User"],
		}),
	}),
});

export const { useUpdateProfileMutation, useListUsersQuery } = usersApi;
