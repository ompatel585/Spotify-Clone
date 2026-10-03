import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";
import { BaseRepository } from "../../common/repositories/base.repository.js";
import { type FacetResult, facetPage, toPaginated } from "../../common/utils/facet-page.util.js";
import { isDuplicateKeyError } from "../../common/utils/mongo-errors.util.js";
import type { Paginated } from "../../contracts/index.js";
import { SONGS_COLLECTION } from "../songs/schemas/song.schema.js";
import { type SongWithAlbumTitle, WITH_ALBUM_TITLE } from "../songs/songs.repository.js";
import { Like } from "./schemas/like.schema.js";

@Injectable()
export class LibraryRepository extends BaseRepository<Like> {
	constructor(@InjectModel(Like.name) model: Model<Like>) {
		super(model);
	}

	/** Idempotent: an existing like keeps its original timestamp. */
	async like(userId: Types.ObjectId, songId: Types.ObjectId, now: Date): Promise<void> {
		try {
			await this.model.updateOne({ userId, songId }, { $setOnInsert: { createdAt: now } }, { upsert: true });
		} catch (error) {
			// Two concurrent upserts can both miss and race to insert; the loser is already liked.
			if (!isDuplicateKeyError(error)) throw error;
		}
	}

	async unlike(userId: Types.ObjectId, songId: Types.ObjectId): Promise<void> {
		await this.model.deleteOne({ userId, songId });
	}

	/** Newest like first; likes of deleted songs are skipped (and not counted). One aggregation. */
	async likedSongs(
		userId: Types.ObjectId,
		page: number,
		limit: number,
	): Promise<Paginated<SongWithAlbumTitle>> {
		const [result] = await this.model.aggregate<FacetResult<SongWithAlbumTitle>>([
			{ $match: { userId } },
			{ $sort: { createdAt: -1, _id: -1 } },
			{
				$lookup: {
					from: SONGS_COLLECTION,
					localField: "songId",
					foreignField: "_id",
					pipeline: [{ $project: { _id: 1 } }],
					as: "exists",
				},
			},
			{ $match: { exists: { $ne: [] } } },
			facetPage(page, limit, [
				{
					$lookup: {
						from: SONGS_COLLECTION,
						localField: "songId",
						foreignField: "_id",
						pipeline: WITH_ALBUM_TITLE,
						as: "song",
					},
				},
				{ $unwind: "$song" },
				{ $replaceRoot: { newRoot: "$song" } },
			]),
		]);
		return toPaginated(result, page, limit);
	}

	async likedSongIds(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
		const rows = await this.find({ userId }, { projection: { songId: 1, _id: 0 }, sort: { createdAt: -1 } });
		return rows.map((row) => row.songId);
	}
}
