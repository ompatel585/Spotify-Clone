import type { PageQuery } from "./pagination.types.js";

export interface Song {
	id: string;
	title: string;
	artist: string;
	albumId: string | null;
	albumTitle: string | null;
	trackNumber: number | null;
	imageUrl: string;
	audioUrl: string;
	/** Seconds */
	duration: number;
	playCount: number;
	createdAt: string;
}

export interface Album {
	id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songCount: number;
	/** Seconds */
	totalDuration: number;
	createdAt: string;
}

export interface AlbumWithTracks extends Album {
	songs: Song[];
}

export interface RecentlyPlayedItem {
	song: Song;
	playedAt: string;
}

export interface LikedSongIdsResponse {
	songIds: string[];
}

export interface RecordPlayRequest {
	songId: string;
}

export type SongSort = "newest" | "oldest" | "title" | "popular";

export interface SongListQuery extends PageQuery {
	q?: string;
	albumId?: string;
	sort?: SongSort;
}

export interface AlbumListQuery extends PageQuery {
	q?: string;
}

/** Admin: create a song from already-uploaded Cloudinary assets. */
export interface CreateSongRequest {
	title: string;
	artist: string;
	albumId?: string | null;
	trackNumber?: number | null;
	duration: number;
	audioUrl: string;
	audioPublicId?: string | null;
	imageUrl: string;
	imagePublicId?: string | null;
}

export type UpdateSongRequest = Partial<CreateSongRequest>;

export interface CreateAlbumRequest {
	title: string;
	artist: string;
	releaseYear: number;
	imageUrl: string;
	imagePublicId?: string | null;
}

export type UpdateAlbumRequest = Partial<CreateAlbumRequest>;
