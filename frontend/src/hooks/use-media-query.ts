"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Tailwind `lg`: where the shell gets its right panel (friends / queue). */
export const LARGE_SCREEN_QUERY = "(min-width: 1024px)";

/**
 * Tracks a CSS media query. `serverValue` is what the server and the hydration pass render; the real value is
 * applied right after, so there is no hydration mismatch.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () => list.removeEventListener("change", onChange);
		},
		[query],
	);
	const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
	return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}
