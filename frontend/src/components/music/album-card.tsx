"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useLazyGetAlbumQuery } from "@/api/endpoints/albums-api";
import { CoverImage } from "@/components/common/cover-image";
import { PlayButton } from "@/components/music/play-button";
import { routes } from "@/constants/routes";
import { usePlayCollection } from "@/hooks/use-play-collection";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { isAlbumPlaying } from "@/store/selectors/player-selectors";
import { pause } from "@/store/slices/player-slice";
import type { Album } from "@/types/contracts";

export function AlbumCard({ album, eager = false }: { album: Album; eager?: boolean }) {
	const dispatch = useAppDispatch();
	const playCollection = usePlayCollection();
	const [loadAlbum, { isFetching }] = useLazyGetAlbumQuery();
	const isPlaying = useAppSelector((state) => isAlbumPlaying(state, album.id));
	const isCurrent = useAppSelector(
		(state) => state.player.queue[state.player.currentIndex]?.albumId === album.id,
	);

	// The list endpoint has no tracks, so they are fetched (and cached) when the button is pressed.
	const handlePlay = async () => {
		if (isPlaying) {
			dispatch(pause());
			return;
		}
		const result = await loadAlbum(album.id, true);
		if (result.data && result.data.songs.length > 0) playCollection(result.data.songs);
		else toast.error(`Could not play "${album.title}"`);
	};

	return (
		<div className="group relative flex flex-col gap-3 rounded-lg bg-surface-elevated p-3 transition-colors focus-within:bg-surface-hover hover:bg-surface-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-primary">
			<div className="relative">
				<CoverImage
					src={album.imageUrl}
					alt={`${album.title} cover`}
					sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 45vw"
					eager={eager}
					className="rounded-md shadow-lg"
				/>
				<PlayButton
					subject={album.title}
					isPlaying={isPlaying}
					isCurrent={isCurrent}
					loading={isFetching}
					onClick={handlePlay}
					className="absolute right-2 bottom-2 z-10"
				/>
			</div>
			<div className="min-w-0">
				<Link
					href={routes.album(album.id)}
					aria-label={`${album.title} by ${album.artist}, ${album.releaseYear}`}
					className="block outline-none after:absolute after:inset-0 after:content-['']"
				>
					<p className="truncate font-bold text-foreground text-sm">{album.title}</p>
				</Link>
				<p className="truncate text-muted text-sm">
					{album.releaseYear} • {album.artist}
				</p>
			</div>
		</div>
	);
}
