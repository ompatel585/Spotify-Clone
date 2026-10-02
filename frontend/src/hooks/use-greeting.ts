"use client";

import { useSyncExternalStore } from "react";

function getGreeting(hour: number): string {
	if (hour < 5) return "Good night";
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

const subscribe = () => () => {};

/** Time-of-day greeting. Renders a neutral "Welcome" on the server and during hydration, then the local one. */
export function useGreeting(): string {
	return useSyncExternalStore(
		subscribe,
		() => getGreeting(new Date().getHours()),
		() => "Welcome",
	);
}
