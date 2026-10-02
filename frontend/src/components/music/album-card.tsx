import Link from "next/link";
import { CoverImage } from "@/components/common/cover-image";
import { routes } from "@/constants/routes";
import type { Album } from "@/types/contracts";

export function AlbumCard({ album, eager = false }: { album: Album; eager?: boolean }) {
	return (
		<Link
			href={routes.album(album.id)}
			className="group flex flex-col gap-3 rounded-lg bg-surface-elevated p-3 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
		>
			<CoverImage
				src={album.imageUrl}
				alt={`${album.title} cover`}
				sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 45vw"
				eager={eager}
				className="rounded-md shadow-lg"
			/>
			<div className="min-w-0">
				<p className="truncate font-bold text-foreground text-sm">{album.title}</p>
				<p className="truncate text-muted text-sm">
					{album.releaseYear} • {album.artist}
				</p>
			</div>
		</Link>
	);
}
