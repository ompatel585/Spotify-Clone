"use client";

import { createContext, type ReactNode, useEffect, useState } from "react";

export const AudioContext = createContext<HTMLAudioElement | null>(null);

/**
 * Owns the one `HTMLAudioElement` of the app. It lives in the root layout, above every route, so music keeps
 * playing while the user navigates. The element only exists on the client, after mount (`null` before that).
 */
export function AudioProvider({ children }: { children: ReactNode }) {
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

	useEffect(() => {
		const element = new Audio();
		element.preload = "metadata";
		setAudio(element);
		return () => {
			element.pause();
			element.removeAttribute("src");
			element.load();
			setAudio(null);
		};
	}, []);

	return <AudioContext value={audio}>{children}</AudioContext>;
}
