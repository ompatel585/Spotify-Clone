import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, PipelineStage, Types } from "mongoose";
import { PlayEvent } from "../plays/schemas/play-event.schema.js";
import { SONGS_COLLECTION, Song } from "../songs/schemas/song.schema.js";
import { type SongWithAlbumTitle, WITH_ALBUM_TITLE } from "../songs/songs.repository.js";

export interface ListeningProfile {
	/** Most played artists first. */
	topArtists: string[];
	/** Every song the user has a retained play event for. */
	playedSongIds: Types.ObjectId[];
}

/** Read-only aggregations over songs and play events; owns no collection of its own. */
@Injectable()
export class DiscoveryRepository {
	constructor(
		@InjectModel(Song.name) private readonly songs: Model<Song>,
		@InjectModel(PlayEvent.name) private readonly plays: Model<PlayEvent>,
	) {}

	async allSongIds(): Promise<Types.ObjectId[]> {
		const rows = await this.songs.find({}, { _id: 1 }).lean<{ _id: Types.ObjectId }[]>().exec();
		return rows.map((row) => row._id);
	}

	/** The given songs with album titles, in the order of `ids`; missing ids are dropped. */
	async songsByIds(ids: Types.ObjectId[]): Promise<SongWithAlbumTitle[]> {
		const rows = await this.songs.aggregate<SongWithAlbumTitle>([
			{ $match: { _id: { $in: ids } } },
			...WITH_ALBUM_TITLE,
		]);
		const byId = new Map(rows.map((row) => [row._id.toString(), row]));
		return ids.flatMap((id) => byId.get(id.toString()) ?? []);
	}

	newest(limit: number): Promise<SongWithAlbumTitle[]> {
		return this.songs.aggregate<SongWithAlbumTitle>([
			{ $sort: { createdAt: -1, _id: -1 } },
			{ $limit: limit },
			...WITH_ALBUM_TITLE,
		]);
	}

	/**
	 * Songs ranked by play events since `since`, topped up with the all-time most played songs so the
	 * result is full whenever the catalog is big enough. Ties fall back to the all-time play count.
	 */
	trending(since: Date, limit: number): Promise<SongWithAlbumTitle[]> {
		return this.plays.aggregate<SongWithAlbumTitle>([
			{ $match: { playedAt: { $gte: since } } },
			{ $group: { _id: "$songId", recent: { $sum: 1 } } },
			{ $sort: { recent: -1, _id: 1 } },
			// Over-fetch a little: some recently played songs may have been deleted since.
			{ $limit: limit * 2 },
			{
				$unionWith: {
					coll: SONGS_COLLECTION,
					pipeline: [
						{ $sort: { playCount: -1, _id: 1 } },
						{ $limit: limit },
						{ $project: { _id: 1, recent: { $literal: 0 } } },
					],
				},
			},
			{ $group: { _id: "$_id", recent: { $max: "$recent" } } },
			...this.joinSongs(),
			{ $sort: { recent: -1, "song.playCount": -1, _id: 1 } },
			{ $limit: limit },
			{ $replaceRoot: { newRoot: "$song" } },
		]);
	}

	/** Top artists over the window and all songs the user has played, in one aggregation. */
	async listeningProfile(
		userId: Types.ObjectId,
		since: Date,
		artistLimit: number,
	): Promise<ListeningProfile> {
		const [result] = await this.plays.aggregate<ListeningProfile>([
			{ $match: { userId } },
			{
				$facet: {
					topArtists: [
						{ $match: { playedAt: { $gte: since } } },
						{ $group: { _id: "$songId", plays: { $sum: 1 } } },
						{
							$lookup: {
								from: SONGS_COLLECTION,
								localField: "_id",
								foreignField: "_id",
								pipeline: [{ $project: { artist: 1 } }],
								as: "song",
							},
						},
						{ $unwind: "$song" },
						{ $group: { _id: "$song.artist", plays: { $sum: "$plays" } } },
						{ $sort: { plays: -1, _id: 1 } },
						{ $limit: artistLimit },
					],
					played: [{ $group: { _id: "$songId" } }],
				},
			},
			{ $project: { topArtists: "$topArtists._id", playedSongIds: "$played._id" } },
		]);
		return result ?? { topArtists: [], playedSongIds: [] };
	}

	/**
	 * Ordered in tiers: unheard songs by the top artists (in artist rank), then other unheard songs, then
	 * songs already played; popularity orders each tier. A single sort over the catalog, so no duplicates.
	 */
	personalized(profile: ListeningProfile, limit: number): Promise<SongWithAlbumTitle[]> {
		const played = { $in: ["$_id", profile.playedSongIds] };
		const artistRank = { $indexOfArray: [profile.topArtists, "$artist"] };
		return this.songs.aggregate<SongWithAlbumTitle>([
			{
				$set: {
					tier: { $cond: [played, 2, { $cond: [{ $gte: [artistRank, 0] }, 0, 1] }] },
					artistRank: { $cond: [{ $gte: [artistRank, 0] }, artistRank, profile.topArtists.length] },
				},
			},
			{ $sort: { tier: 1, artistRank: 1, playCount: -1, _id: 1 } },
			{ $limit: limit },
			{ $unset: ["tier", "artistRank"] },
			...WITH_ALBUM_TITLE,
		]);
	}

	popular(limit: number): Promise<SongWithAlbumTitle[]> {
		return this.songs.aggregate<SongWithAlbumTitle>([
			{ $sort: { playCount: -1, _id: 1 } },
			{ $limit: limit },
			...WITH_ALBUM_TITLE,
		]);
	}

	private joinSongs(): PipelineStage[] {
		return [
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
		];
	}
}
