import { Injectable } from "@nestjs/common";
import type { Activity } from "../../../contracts/index.js";
import { SongsRepository } from "../../songs/songs.repository.js";

export type ActivityChange = { changed: false } | { changed: true; activity: Activity | null };

const UNCHANGED: ActivityChange = { changed: false };

/**
 * Now-playing state per user (not per socket). The song's title, artist and cover are read from the
 * database, never taken from the client. In memory for a single instance (see AuthenticatedIoAdapter).
 */
@Injectable()
export class ActivityService {
	private readonly activities = new Map<string, Activity>();
	/** Bumped on every request, so a slow song lookup never overwrites a newer update. */
	private readonly versions = new Map<string, number>();

	constructor(private readonly songs: SongsRepository) {}

	/**
	 * Sets the user's activity (`null` = idle). Resolves to `null` for an unknown song and to
	 * `changed: false` for duplicates and for requests superseded by a newer one.
	 */
	async update(
		userId: string,
		songId: string | null,
		isOnline: () => boolean,
	): Promise<ActivityChange | null> {
		const version = (this.versions.get(userId) ?? 0) + 1;
		this.versions.set(userId, version);

		const current = this.activities.get(userId) ?? null;
		if ((current?.songId ?? null) === songId) return UNCHANGED;

		let next: Activity | null = null;
		if (songId !== null) {
			const song = await this.songs.findById(songId, { projection: { title: 1, artist: 1, imageUrl: 1 } });
			if (!song) return null;
			next = {
				songId,
				title: song.title,
				artist: song.artist,
				imageUrl: song.imageUrl,
				startedAt: new Date().toISOString(),
			};
		}

		// A newer update arrived, or the user went offline, while the song was being read.
		if (this.versions.get(userId) !== version || !isOnline()) return UNCHANGED;
		if ((this.activities.get(userId)?.songId ?? null) === songId) return UNCHANGED;

		if (next) this.activities.set(userId, next);
		else this.activities.delete(userId);
		return { changed: true, activity: next };
	}

	clear(userId: string): void {
		this.activities.delete(userId);
		this.versions.delete(userId);
	}

	snapshot(): Record<string, Activity> {
		return Object.fromEntries(this.activities);
	}
}
