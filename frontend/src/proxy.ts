import { type NextRequest, NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/utils/safe-redirect";

const REFRESH_COOKIE = "refresh_token";
const AUTH_PAGES = new Set(["/login", "/register"]);
const isDev = process.env.NODE_ENV !== "production";

/** Paths reachable without a session. The matcher below already skips most of these; this is the explicit list. */
function isPublicPath(pathname: string): boolean {
	if (AUTH_PAGES.has(pathname)) return true;
	if (isDev && pathname === "/design-system") return true;
	return (
		pathname.startsWith("/api/") ||
		pathname.startsWith("/socket.io/") ||
		pathname.startsWith("/_next/") ||
		pathname === "/icon.svg" ||
		pathname === "/manifest.webmanifest" ||
		pathname === "/robots.txt" ||
		/\.[a-z0-9]+$/i.test(pathname) // static files from /public
	);
}

/**
 * UX-only route guard: the presence of the `refresh_token` cookie says nothing about whether it is still valid.
 * The API is the real authority and answers 401 for anything unauthenticated; the client then refreshes or
 * sends the user to /login (see api/reauth-base-query.ts).
 */
export function proxy(request: NextRequest) {
	const { pathname, search, searchParams } = request.nextUrl;
	const hasSession = request.cookies.has(REFRESH_COOKIE);

	if (AUTH_PAGES.has(pathname)) {
		// `expired=1` is set when a session turned out to be dead; never bounce those users back, or we would loop.
		if (hasSession && !searchParams.has("expired")) {
			return NextResponse.redirect(new URL("/", request.url));
		}
		return NextResponse.next();
	}

	if (hasSession || isPublicPath(pathname)) return NextResponse.next();

	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("next", getSafeRedirectPath(`${pathname}${search}`));
	return NextResponse.redirect(loginUrl);
}

export const config = {
	matcher: ["/((?!api/|socket.io/|_next/|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
