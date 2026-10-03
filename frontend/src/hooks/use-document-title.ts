"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentSong } from "@/store/selectors/player-selectors";

/**
 * Shows "Title • Artist" in the tab while a song plays and puts the page's own title back otherwise. Next
 * rewrites <title> on navigation, so a MutationObserver treats such a change as the new "own" title and
 * re-applies the song title on top of it.
 */
export function useDocumentTitle() {
	const song = useAppSelector(selectCurrentSong);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const nowPlaying = song && isPlaying ? `${song.title} • ${song.artist}` : null;

	useEffect(() => {
		if (!nowPlaying) return;
		let pageTitle = document.title;
		const apply = () => {
			if (document.title !== nowPlaying) {
				pageTitle = document.title;
				document.title = nowPlaying;
			}
		};
		apply();

		const observer = new MutationObserver(apply);
		observer.observe(document.head, { childList: true, characterData: true, subtree: true });
		return () => {
			observer.disconnect();
			document.title = pageTitle;
		};
	}, [nowPlaying]);
}
