"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useLazyGetAlbumQuery } from "@/api/endpoints/albums-api";
import { CoverImage } from "@/components/common/cover-image";
import { PlayButton } from "@/components/music/play-button";
import { routes } from "@/constants/routes";
import { usePlayCollection } from "@/hooks/use-play-collection";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { isAlbumPlaying, isSongCurrent, isSongPlaying } from "@/store/selectors/player-selectors";
import { pause } from "@/store/slices/player-slice";
import type { Album, SearchResults, Song } from "@/types/contracts";

export type TopResult = { kind: "song"; song: Song } | { kind: "album"; album: Album };

function normalize(value: string): string {
	return value.trim().toLocaleLowerCase();
}

/** Results arrive ranked per type; an album only wins when its title matches the query better than the top song. */
export function pickTopResult(results: SearchResults): TopResult | null {
	const [song] = results.songs;
	const [album] = results.albums;
	if (!song) return album ? { kind: "album", album } : null;
	if (!album) return { kind: "song", song };

	const query = normalize(results.query);
	const score = (title: string) => {
		const value = normalize(title);
		if (value === query) return 2;
		return value.startsWith(query) ? 1 : 0;
	};
	return score(album.title) > score(song.title) ? { kind: "album", album } : { kind: "song", song };
}

const cardClass =
	"group relative flex h-full min-h-56 flex-col gap-5 rounded-lg bg-surface-elevated p-5 transition-colors focus-within:bg-surface-hover hover:bg-surface-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-primary";

function TypePill({ label }: { label: string }) {
	return (
		<span className="rounded-full bg-background/60 px-3 py-1 font-bold text-foreground text-xs">{label}</span>
	);
}

function SongTopResult({ song }: { song: Song }) {
	const dispatch = useAppDispatch();
	const playCollection = usePlayCollection();
	const isCurrent = useAppSelector((state) => isSongCurrent(state, song.id));
	const isPlaying = useAppSelector((state) => isSongPlaying(state, song.id));
	const title = (
		<p className="line-clamp-2 font-bold text-3xl text-foreground tracking-tight">{song.title}</p>
	);

	return (
		<div className={cardClass}>
			<CoverImage
				src={song.imageUrl}
				alt={`${song.title} cover`}
				sizes="96px"
				eager
				className="size-24 rounded-md shadow-black/50 shadow-xl"
			/>
			<div className="flex min-w-0 flex-col gap-2">
				{song.albumId ? (
					<Link
						href={routes.album(song.albumId)}
						aria-label={`${song.title} by ${song.artist}${song.albumTitle ? `, from ${song.albumTitle}` : ""}`}
						className="block outline-none after:absolute after:inset-0 after:content-['']"
					>
						{title}
					</Link>
				) : (
					title
				)}
				<div className="flex min-w-0 items-center gap-2 text-muted text-sm">
					<TypePill label="Song" />
					<span className="truncate font-medium text-foreground">{song.artist}</span>
				</div>
			</div>
			<PlayButton
				subject={song.title}
				isPlaying={isPlaying}
				isCurrent={isCurrent}
				onClick={() => (isPlaying ? dispatch(pause()) : playCollection([song], 0))}
				className="absolute right-5 bottom-5 z-10"
			/>
		</div>
	);
}

function AlbumTopResult({ album }: { album: Album }) {
	const dispatch = useAppDispatch();
	const playCollection = usePlayCollection();
	const [loadAlbum, { isFetching }] = useLazyGetAlbumQuery();
	const isPlaying = useAppSelector((state) => isAlbumPlaying(state, album.id));
	const isCurrent = useAppSelector(
		(state) => state.player.queue[state.player.currentIndex]?.albumId === album.id,
	);

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
		<div className={cardClass}>
			<CoverImage
				src={album.imageUrl}
				alt={`${album.title} cover`}
				sizes="96px"
				eager
				className="size-24 rounded-md shadow-black/50 shadow-xl"
			/>
			<div className="flex min-w-0 flex-col gap-2">
				<Link
					href={routes.album(album.id)}
					aria-label={`${album.title} by ${album.artist}, ${album.releaseYear}`}
					className="block outline-none after:absolute after:inset-0 after:content-['']"
				>
					<p className="line-clamp-2 font-bold text-3xl text-foreground tracking-tight">{album.title}</p>
				</Link>
				<div className="flex min-w-0 items-center gap-2 text-muted text-sm">
					<TypePill label="Album" />
					<span className="truncate font-medium text-foreground">{album.artist}</span>
				</div>
			</div>
			<PlayButton
				subject={album.title}
				isPlaying={isPlaying}
				isCurrent={isCurrent}
				loading={isFetching}
				onClick={handlePlay}
				className="absolute right-5 bottom-5 z-10"
			/>
		</div>
	);
}

export function TopResultSection({ result }: { result: TopResult }) {
	return (
		<section aria-labelledby="top-result-heading" className="flex min-w-0 flex-col">
			<h2 id="top-result-heading" className="mb-4 font-bold text-2xl text-foreground tracking-tight">
				Top result
			</h2>
			{result.kind === "song" ? (
				<SongTopResult song={result.song} />
			) : (
				<AlbumTopResult album={result.album} />
			)}
		</section>
	);
}
