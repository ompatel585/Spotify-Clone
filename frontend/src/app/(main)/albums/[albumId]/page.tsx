import type { Metadata } from "next";
import { getServerEnv } from "@/config/env";
import type { AlbumWithTracks } from "@/types/contracts";
import { AlbumView } from "@/views/album-view";

interface AlbumPageProps {
	params: Promise<{ albumId: string }>;
}

async function fetchAlbum(albumId: string): Promise<AlbumWithTracks | null> {
	try {
		const response = await fetch(`${getServerEnv().API_ORIGIN}/api/albums/${encodeURIComponent(albumId)}`, {
			next: { revalidate: 60 },
		});
		if (!response.ok) return null;
		return (await response.json()) as AlbumWithTracks;
	} catch {
		return null;
	}
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
	const { albumId } = await params;
	const album = await fetchAlbum(albumId);
	if (!album) return { title: "Album" };

	const description = `${album.title} by ${album.artist}, ${album.releaseYear}. ${album.songCount} songs.`;
	return {
		title: `${album.title} - ${album.artist}`,
		description,
		openGraph: { title: album.title, description, images: album.imageUrl ? [album.imageUrl] : undefined },
	};
}

export default async function AlbumPage({ params }: AlbumPageProps) {
	const { albumId } = await params;
	return <AlbumView albumId={albumId} />;
}
