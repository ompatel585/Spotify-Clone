import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { FEATURED_SIZE, type Song } from "../../contracts/index.js";
import { toSong } from "../songs/mappers/song.mapper.js";
import { DiscoveryRepository } from "./discovery.repository.js";

const DAY_MS = 24 * 60 * 60 * 1000;
export const TRENDING_WINDOW_MS = 7 * DAY_MS;
export const MADE_FOR_YOU_WINDOW_MS = 90 * DAY_MS;
export const MADE_FOR_YOU_TOP_ARTISTS = 5;

/** Stable per (song, UTC day): the same songs win all day, a different set tomorrow. */
function dailyRank(id: Types.ObjectId, day: number): string {
	return createHash("sha1").update(`${day}:${id.toString()}`).digest("hex");
}

@Injectable()
export class DiscoveryService {
	constructor(private readonly discovery: DiscoveryRepository) {}

	/** A deterministic daily rotation over the whole catalog (no per-request randomness). */
	async featured(now = new Date()): Promise<Song[]> {
		const day = Math.floor(now.getTime() / DAY_MS);
		const ids = await this.discovery.allSongIds();
		const picked = ids
			.map((id) => ({ id, rank: dailyRank(id, day) }))
			.sort((a, b) => (a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0))
			.slice(0, FEATURED_SIZE)
			.map((entry) => entry.id);
		const songs = await this.discovery.songsByIds(picked);
		return songs.map(toSong);
	}

	async newReleases(limit: number): Promise<Song[]> {
		return (await this.discovery.newest(limit)).map(toSong);
	}

	async trending(limit: number, now = new Date()): Promise<Song[]> {
		const since = new Date(now.getTime() - TRENDING_WINDOW_MS);
		return (await this.discovery.trending(since, limit)).map(toSong);
	}

	/** Signed in: unheard songs by the user's top artists, then unheard popular songs, then anything. */
	async madeForYou(userId: string | undefined, limit: number, now = new Date()): Promise<Song[]> {
		if (!userId) return (await this.discovery.popular(limit)).map(toSong);
		const since = new Date(now.getTime() - MADE_FOR_YOU_WINDOW_MS);
		const profile = await this.discovery.listeningProfile(
			new Types.ObjectId(userId),
			since,
			MADE_FOR_YOU_TOP_ARTISTS,
		);
		return (await this.discovery.personalized(profile, limit)).map(toSong);
	}
}
