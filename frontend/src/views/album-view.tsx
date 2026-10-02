"use client";

import { Disc3 } from "lucide-react";
import Link from "next/link";
import { useGetAlbumQuery } from "@/api/endpoints/albums-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/constants/routes";
import { AlbumHeroSection } from "@/sections/album/album-hero-section";
import { AlbumSkeleton } from "@/sections/album/album-skeleton";
import { AlbumTracksSection } from "@/sections/album/album-tracks-section";
import { getErrorMessage } from "@/utils/errors";

function isMissingAlbum(error: unknown): boolean {
	if (typeof error !== "object" || error === null || !("status" in error)) return false;
	return error.status === 404 || error.status === 400;
}

export function AlbumView({ albumId }: { albumId: string }) {
	const { data: album, isLoading, error, refetch } = useGetAlbumQuery(albumId);

	if (isLoading) return <AlbumSkeleton />;

	if (isMissingAlbum(error)) {
		return (
			<EmptyState
				icon={<Disc3 />}
				title="Album not found"
				description="This album does not exist or may have been removed."
				action={
					<Button asChild>
						<Link href={routes.home}>Go home</Link>
					</Button>
				}
			/>
		);
	}

	if (error || !album) {
		return <ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />;
	}

	return (
		<>
			<AlbumHeroSection album={album} />
			<AlbumTracksSection songs={album.songs} albumTitle={album.title} />
		</>
	);
}
