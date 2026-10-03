"use client";

import { ListMusic, X } from "lucide-react";
import { useEffect } from "react";
import { CoverImage } from "@/components/common/cover-image";
import { EqualizerIcon } from "@/components/music/equalizer-icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentSong, selectUpNext } from "@/store/selectors/player-selectors";
import { playIndex } from "@/store/slices/player-slice";
import { closeRightPanel } from "@/store/slices/ui-slice";
import type { Song } from "@/types/contracts";

function QueueItem({
	song,
	isCurrent,
	isPlaying,
	onSelect,
}: {
	song: Song;
	isCurrent: boolean;
	isPlaying: boolean;
	onSelect: () => void;
}) {
	return (
		<li>
			<button
				type="button"
				onClick={onSelect}
				aria-current={isCurrent || undefined}
				className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
			>
				<CoverImage src={song.imageUrl} alt="" sizes="40px" className="size-10 shrink-0 rounded-sm" />
				<span className="min-w-0 flex-1">
					<span
						className={cn(
							"block truncate font-medium text-sm",
							isCurrent ? "text-primary" : "text-foreground",
						)}
					>
						{song.title}
					</span>
					<span className="block truncate text-muted text-xs">{song.artist}</span>
				</span>
				{isCurrent && isPlaying && <EqualizerIcon />}
			</button>
		</li>
	);
}

/** Right-hand panel with the playing song and what comes after it. Only shown from `md` up. */
export function QueuePanel() {
	const dispatch = useAppDispatch();
	const current = useAppSelector(selectCurrentSong);
	const upNext = useAppSelector(selectUpNext);
	const currentIndex = useAppSelector((state) => state.player.currentIndex);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") dispatch(closeRightPanel());
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [dispatch]);

	return (
		<aside
			aria-label="Queue"
			className="fixed top-2 right-2 bottom-[5.5rem] z-30 hidden w-80 animate-fade-in flex-col overflow-hidden rounded-lg bg-surface-highlight shadow-2xl shadow-black/60 md:flex"
		>
			<div className="flex items-center justify-between px-4 pt-4 pb-2">
				<h2 className="font-bold text-foreground text-lg">Queue</h2>
				<IconButton aria-label="Close queue" className="size-8" onClick={() => dispatch(closeRightPanel())}>
					<X aria-hidden="true" className="size-5" />
				</IconButton>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 [scrollbar-color:var(--color-subtle)_transparent]">
				{current ? (
					<>
						<h3 className="px-2 pt-2 pb-1 font-semibold text-muted text-sm">Now playing</h3>
						<ul>
							<QueueItem song={current} isCurrent isPlaying={isPlaying} onSelect={() => undefined} />
						</ul>
						<h3 className="px-2 pt-4 pb-1 font-semibold text-muted text-sm">Next up</h3>
						{upNext.length > 0 ? (
							<ul>
								{upNext.map((song, offset) => (
									<QueueItem
										// biome-ignore lint/suspicious/noArrayIndexKey: a queue position is its identity; the same song may be queued twice
										key={`${song.id}-${offset}`}
										song={song}
										isCurrent={false}
										isPlaying={false}
										onSelect={() => dispatch(playIndex(currentIndex + 1 + offset))}
									/>
								))}
							</ul>
						) : (
							<p className="px-2 py-2 text-muted text-sm">Nothing queued after this song.</p>
						)}
					</>
				) : (
					<div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
						<ListMusic aria-hidden="true" className="size-12 text-subtle" />
						<p className="font-bold text-foreground">Your queue is empty</p>
						<p className="text-muted text-sm">Play a song or an album and it will show up here.</p>
					</div>
				)}
			</div>
		</aside>
	);
}
