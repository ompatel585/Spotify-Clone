"use client";

import { useCallback } from "react";
import { useLogoutAllMutation, useLogoutMutation, useMeQuery } from "@/api/endpoints/auth-api";
import { routes } from "@/constants/routes";
import { UserRole } from "@/types/contracts";

/** Current session, derived from the `me` query. */
export function useAuth() {
	const { data: user, isLoading, isError, error, refetch } = useMeQuery();
	const [logoutRequest] = useLogoutMutation();
	const [logoutAllRequest] = useLogoutAllMutation();

	// A full navigation discards every in-memory cache and lets the proxy see the cleared cookies.
	const logout = useCallback(async () => {
		await logoutRequest().unwrap();
		window.location.assign(routes.login);
	}, [logoutRequest]);

	const logoutAll = useCallback(async () => {
		await logoutAllRequest().unwrap();
		window.location.assign(routes.login);
	}, [logoutAllRequest]);

	return {
		user,
		isAuthenticated: Boolean(user),
		isAdmin: user?.role === UserRole.Admin,
		isLoading,
		isError,
		error,
		refetch,
		logout,
		logoutAll,
	};
}
