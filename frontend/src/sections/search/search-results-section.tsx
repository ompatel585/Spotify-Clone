"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CoverImage } from "@/components/common/cover-image";
import { AlbumCard } from "@/components/music/album-card";
import { CardGrid } from "@/components/music/card-grid";
import { SectionHeader } from "@/components/music/section-header";
import { TrackList } from "@/components/music/track-list";
import { routes } from "@/constants/routes";
import type { ArtistSummary, SearchResults } from "@/types/contracts";

function artistSearchHref(name: string): string {
	return `${routes.search}?q=${encodeURIComponent(name)}`;
}

function ArtistCard({ artist }: { artist: ArtistSummary }) {
	const songLabel = artist.songCount === 1 ? "1 song" : `${artist.songCount} songs`;

	return (
		<Link
			href={artistSearchHref(artist.name)}
			aria-label={`${artist.name}, artist, ${songLabel}`}
			className="group flex flex-col gap-3 rounded-lg p-3 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
		>
			<CoverImage
				src={artist.imageUrl}
				alt=""
				sizes="(min-width: 1280px) 180px, (min-width: 768px) 25vw, 45vw"
				className="rounded-full shadow-black/40 shadow-lg"
			/>
			<div className="min-w-0">
				<p className="truncate font-bold text-foreground text-sm">{artist.name}</p>
				<p className="truncate text-muted text-sm">Artist</p>
			</div>
		</Link>
	);
}

interface SearchResultsSectionProps {
	results: SearchResults;
	/** The big best-match card, laid out beside the song list on wide screens. */
	topResult: ReactNode;
}

export function SearchResultsSection({ results, topResult }: SearchResultsSectionProps) {
	const { songs, albums, artists } = results;

	return (
		<div className="flex flex-col gap-10">
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
				{topResult}
				{songs.length > 0 && (
					<section aria-labelledby="search-songs-heading" className="min-w-0">
						<SectionHeader id="search-songs-heading" title="Songs" />
						<TrackList songs={songs} label={`Songs matching ${results.query}`} />
					</section>
				)}
			</div>
			{albums.length > 0 && (
				<section aria-labelledby="search-albums-heading">
					<SectionHeader id="search-albums-heading" title="Albums" />
					<CardGrid>
						{albums.map((album) => (
							<AlbumCard key={album.id} album={album} />
						))}
					</CardGrid>
				</section>
			)}
			{artists.length > 0 && (
				<section aria-labelledby="search-artists-heading">
					<SectionHeader id="search-artists-heading" title="Artists" />
					<CardGrid>
						{artists.map((artist) => (
							<ArtistCard key={artist.name} artist={artist} />
						))}
					</CardGrid>
				</section>
			)}
		</div>
	);
}
