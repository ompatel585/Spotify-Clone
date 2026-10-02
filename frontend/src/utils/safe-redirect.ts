const ORIGIN_PROBE = "http://redirect.invalid";

function hasUnsafeCharacter(value: string): boolean {
	for (const char of value) {
		const code = char.charCodeAt(0);
		if (char === "\\" || code <= 0x1f || code === 0x7f) return true;
	}
	return false;
}

/**
 * Returns `value` only when it is a same-origin relative path ("/library", "/search?q=a").
 * Anything else (absolute URLs, protocol-relative "//host", backslashes, control characters) yields `fallback`,
 * which prevents open redirects through `?next=`.
 */
export function getSafeRedirectPath(value: string | string[] | null | undefined, fallback = "/"): string {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (!candidate?.startsWith("/") || candidate.startsWith("//")) return fallback;
	if (hasUnsafeCharacter(candidate)) return fallback;
	try {
		const url = new URL(candidate, ORIGIN_PROBE);
		if (url.origin !== ORIGIN_PROBE) return fallback;
		if (url.pathname === "/login" || url.pathname === "/register") return fallback;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}
