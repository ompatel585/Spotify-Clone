import type { Song } from "./music.types.js";

export interface StatsOverview {
	totalSongs: number;
	totalAlbums: number;
	totalArtists: number;
	totalUsers: number;
	totalPlays: number;
	activeUsers7d: number;
}

export interface PlaysPerDay {
	/** YYYY-MM-DD (UTC) */
	date: string;
	plays: number;
}

export interface TopSong {
	song: Song;
	plays: number;
}

export interface StatsRangeQuery {
	days?: number;
	limit?: number;
}
