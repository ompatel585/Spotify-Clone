import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { baseApi } from "@/api/base-api";
import { baseQuery } from "@/api/base-query";
import { routes } from "@/constants/routes";

/** 401s from these calls mean "wrong credentials / no session", not "access token expired". */
const NO_REFRESH_URLS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]);

/** Single-flight: concurrent 401s share one refresh request (the refresh token rotates, so two would clash). */
let refreshInFlight: Promise<boolean> | null = null;

function getRequestUrl(args: string | FetchArgs): string {
	return typeof args === "string" ? args : args.url;
}

function isOnAuthPage(): boolean {
	return window.location.pathname === routes.login || window.location.pathname === routes.register;
}

function redirectToLogin() {
	if (isOnAuthPage()) return;
	const here = `${window.location.pathname}${window.location.search}`;
	window.location.assign(`${routes.login}?expired=1&next=${encodeURIComponent(here)}`);
}

async function runRefresh(): Promise<boolean> {
	try {
		const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
		if (refresh.ok) return true;
		// Dead session: drop the cookies (best effort) so the proxy does not bounce /login back to /.
		await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
		return false;
	} catch {
		return false;
	}
}

/** Rotates the refresh token. Shared by REST calls and the socket, so concurrent callers reuse one request. */
export function refreshSession(): Promise<boolean> {
	refreshInFlight ??= runRefresh().finally(() => {
		refreshInFlight = null;
	});
	return refreshInFlight;
}

export const reauthBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions,
) => {
	let result = await baseQuery(args, api, extraOptions);
	if (result.error?.status !== 401 || NO_REFRESH_URLS.has(getRequestUrl(args))) return result;

	if (await refreshSession()) {
		result = await baseQuery(args, api, extraOptions);
		return result;
	}

	api.dispatch(baseApi.util.resetApiState());
	redirectToLogin();
	return result;
};
