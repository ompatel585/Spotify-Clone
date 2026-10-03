import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";
import { BaseRepository } from "../../common/repositories/base.repository.js";
import { isDuplicateKeyError } from "../../common/utils/mongo-errors.util.js";
import { SONGS_COLLECTION } from "../songs/schemas/song.schema.js";
import { type SongWithAlbumTitle, WITH_ALBUM_TITLE } from "../songs/songs.repository.js";
import { PlayEvent } from "./schemas/play-event.schema.js";
import { PlayMarker } from "./schemas/play-marker.schema.js";

export interface RecentPlayRow {
	playedAt: Date;
	song: SongWithAlbumTitle;
}

@Injectable()
export class PlaysRepository extends BaseRepository<PlayEvent> {
	constructor(
		@InjectModel(PlayEvent.name) model: Model<PlayEvent>,
		@InjectModel(PlayMarker.name) private readonly markers: Model<PlayMarker>,
	) {
		super(model);
	}

	/**
	 * Atomically claims the right to count a play: succeeds only if the user has no marker for the song
	 * or the existing one is older than `cutoff`. A fresh marker makes the upsert try to insert a duplicate
	 * key, which is the "already counted recently" signal. Concurrent callers race on the same document,
	 * so exactly one wins.
	 */
	async claimPlay(userId: Types.ObjectId, songId: Types.ObjectId, now: Date, cutoff: Date): Promise<boolean> {
		try {
			await this.markers.updateOne(
				{ userId, songId, lastCountedAt: { $lte: cutoff } },
				{ $set: { lastCountedAt: now } },
				{ upsert: true },
			);
			return true;
		} catch (error) {
			if (isDuplicateKeyError(error)) return false;
			throw error;
		}
	}

	async record(userId: Types.ObjectId, songId: Types.ObjectId, playedAt: Date): Promise<void> {
		await this.create({ userId, songId, playedAt });
	}

	/** Distinct songs, most recent play first, with album titles; songs that no longer exist are dropped. */
	recentDistinct(userId: Types.ObjectId, limit: number): Promise<RecentPlayRow[]> {
		return this.model.aggregate<RecentPlayRow>([
			{ $match: { userId } },
			{ $group: { _id: "$songId", playedAt: { $max: "$playedAt" } } },
			{ $sort: { playedAt: -1, _id: 1 } },
			{
				$lookup: {
					from: SONGS_COLLECTION,
					localField: "_id",
					foreignField: "_id",
					pipeline: WITH_ALBUM_TITLE,
					as: "song",
				},
			},
			{ $unwind: "$song" },
			{ $limit: limit },
			{ $project: { _id: 0, playedAt: 1, song: 1 } },
		]);
	}
}
