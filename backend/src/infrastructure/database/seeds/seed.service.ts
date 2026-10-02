import { Injectable } from "@nestjs/common";
import type { Types } from "mongoose";
import { AlbumsRepository } from "../../../modules/albums/albums.repository.js";
import { SongsRepository } from "../../../modules/songs/songs.repository.js";
import { ALBUMS } from "./data/albums.data.js";
import { SONGS } from "./data/songs.data.js";

export interface SeedCounts {
	created: number;
	updated: number;
	unchanged: number;
}

export interface SeedSummary {
	albums: SeedCounts;
	songs: SeedCounts;
}

const keyOf = (title: string, artist: string): string => `${title}\u0000${artist}`;

/** FNV-1a: a stable hash so the seeded play counts are identical on every run and machine. */
function fnv1a(input: string): number {
	let hash = 0x811c9dc5;
	for (const char of input) {
		hash ^= char.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash;
}

const PLAY_COUNT_MIN = 50;
const PLAY_COUNT_SPAN = 4951; // 50..5000 inclusive

/**
 * Idempotent catalog seed. Rows are matched by natural key (title + artist) and only touched when a seeded field
 * differs; nothing is ever deleted, and `playCount` is only set on creation so real plays are not reset.
 */
@Injectable()
export class SeedService {
	constructor(
		private readonly albums: AlbumsRepository,
		private readonly songs: SongsRepository,
	) {}

	async run(): Promise<SeedSummary> {
		const albumIds = new Map<string, Types.ObjectId>();
		const albumCounts = this.emptyCounts();
		const existingAlbums = new Map((await this.albums.find()).map((a) => [keyOf(a.title, a.artist), a]));

		for (const seed of ALBUMS) {
			const existing = existingAlbums.get(keyOf(seed.title, seed.artist));
			if (!existing) {
				const created = await this.albums.create(seed);
				albumIds.set(seed.title, created._id);
				albumCounts.created++;
				continue;
			}
			albumIds.set(seed.title, existing._id);
			if (existing.imageUrl === seed.imageUrl && existing.releaseYear === seed.releaseYear) {
				albumCounts.unchanged++;
			} else {
				await this.albums.updateById(existing._id, {
					$set: { imageUrl: seed.imageUrl, releaseYear: seed.releaseYear },
				});
				albumCounts.updated++;
			}
		}

		const songCounts = this.emptyCounts();
		const existingSongs = new Map((await this.songs.find()).map((s) => [keyOf(s.title, s.artist), s]));

		for (const seed of SONGS) {
			const albumId = seed.album ? (albumIds.get(seed.album.title) ?? null) : null;
			const wanted = {
				albumId,
				trackNumber: seed.album?.trackNumber ?? null,
				imageUrl: `/media/covers/${seed.slug}.jpg`,
				audioUrl: `/media/songs/${seed.slug}.mp3`,
				duration: seed.duration,
			};

			const existing = existingSongs.get(keyOf(seed.title, seed.artist));
			if (!existing) {
				const playCount = PLAY_COUNT_MIN + (fnv1a(keyOf(seed.title, seed.artist)) % PLAY_COUNT_SPAN);
				await this.songs.create({ title: seed.title, artist: seed.artist, ...wanted, playCount });
				songCounts.created++;
				continue;
			}

			const unchanged =
				(existing.albumId?.toString() ?? null) === (albumId?.toString() ?? null) &&
				existing.trackNumber === wanted.trackNumber &&
				existing.imageUrl === wanted.imageUrl &&
				existing.audioUrl === wanted.audioUrl &&
				existing.duration === wanted.duration;
			if (unchanged) {
				songCounts.unchanged++;
			} else {
				await this.songs.updateById(existing._id, { $set: wanted });
				songCounts.updated++;
			}
		}

		return { albums: albumCounts, songs: songCounts };
	}

	private emptyCounts(): SeedCounts {
		return { created: 0, updated: 0, unchanged: 0 };
	}
}
