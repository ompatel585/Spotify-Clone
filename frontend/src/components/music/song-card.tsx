import Link from "next/link";
import { CoverImage } from "@/components/common/cover-image";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/cn";
import type { Song } from "@/types/contracts";

const cardClass = "group flex flex-col gap-3 rounded-lg bg-surface-elevated p-3 transition-colors";

export function SongCard({ song }: { song: Song }) {
	const content = (
		<>
			<CoverImage
				src={song.imageUrl}
				alt={`${song.title} cover`}
				sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 45vw"
				className="rounded-md shadow-lg"
			/>
			<div className="min-w-0">
				<p className="truncate font-bold text-foreground text-sm">{song.title}</p>
				<p className="truncate text-muted text-sm">{song.artist}</p>
			</div>
		</>
	);

	if (song.albumId) {
		return (
			<Link
				href={routes.album(song.albumId)}
				aria-label={`${song.title} by ${song.artist}${song.albumTitle ? `, from ${song.albumTitle}` : ""}`}
				className={cn(cardClass, "hover:bg-surface-hover focus-visible:bg-surface-hover")}
			>
				{content}
			</Link>
		);
	}
	return <div className={cardClass}>{content}</div>;
}
