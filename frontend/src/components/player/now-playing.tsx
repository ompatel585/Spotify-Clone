import Link from "next/link";
import { CoverImage } from "@/components/common/cover-image";
import { LikeButton } from "@/components/music/like-button";
import { routes } from "@/constants/routes";
import type { Song } from "@/types/contracts";

export function NowPlaying({ song }: { song: Song }) {
	return (
		<div className="flex min-w-0 items-center gap-3">
			<CoverImage
				src={song.imageUrl}
				alt={`${song.title} cover`}
				sizes="56px"
				className="size-14 shrink-0 rounded-md"
			/>
			<div className="min-w-0">
				{song.albumId ? (
					<Link
						href={routes.album(song.albumId)}
						className="block truncate font-medium text-foreground text-sm hover:underline"
					>
						{song.title}
					</Link>
				) : (
					<p className="truncate font-medium text-foreground text-sm">{song.title}</p>
				)}
				<p className="truncate text-muted text-xs">{song.artist}</p>
			</div>
			<LikeButton song={song} />
		</div>
	);
}
