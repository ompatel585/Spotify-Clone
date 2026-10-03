import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import type { RecentlyPlayedItem } from "../../contracts/index.js";
import { SongsRepository } from "../songs/songs.repository.js";
import { toRecentlyPlayed } from "./mappers/play.mapper.js";
import { PlaysRepository } from "./plays.repository.js";

/** A repeat report of the same song by the same user inside this window is ignored. */
export const PLAY_DEDUPE_MS = 20_000;

@Injectable()
export class PlaysService {
	constructor(
		private readonly plays: PlaysRepository,
		private readonly songs: SongsRepository,
	) {}

	/** Resolves to whether the play was counted (false = duplicate within the window). */
	async record(userId: string, songId: string): Promise<boolean> {
		if (!(await this.songs.exists({ _id: songId }))) throw new NotFoundException(`Song ${songId} not found`);

		const user = new Types.ObjectId(userId);
		const song = new Types.ObjectId(songId);
		const now = new Date();
		const claimed = await this.plays.claimPlay(user, song, now, new Date(now.getTime() - PLAY_DEDUPE_MS));
		if (!claimed) return false;

		await this.plays.record(user, song, now);
		await this.songs.incrementPlayCount(song);
		return true;
	}

	async recent(userId: string, limit: number): Promise<RecentlyPlayedItem[]> {
		const rows = await this.plays.recentDistinct(new Types.ObjectId(userId), limit);
		return rows.map(toRecentlyPlayed);
	}
}
