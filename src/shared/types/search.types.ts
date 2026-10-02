import type { Album, Song } from "./music.types.js";

export interface ArtistSummary {
	name: string;
	imageUrl: string;
	songCount: number;
}

export interface SearchQuery {
	q: string;
	limit?: number;
}

export interface SearchResults {
	query: string;
	songs: Song[];
	albums: Album[];
	artists: ArtistSummary[];
}
