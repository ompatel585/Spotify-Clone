import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, type PipelineStage, type QueryFilter, Types } from "mongoose";
import { BaseRepository, type Lean } from "../../common/repositories/base.repository.js";
import { escapeRegex } from "../../common/utils/escape-regex.util.js";
import { type FacetResult, facetPage, toPaginated } from "../../common/utils/facet-page.util.js";
import { clampLimit, clampPage } from "../../common/utils/pagination.util.js";
import type { Paginated, SongListQuery, SongSort } from "../../contracts/index.js";
import { ALBUMS_COLLECTION } from "../albums/schemas/album.schema.js";
import { Song } from "./schemas/song.schema.js";

/** A lean song plus the title of its album, resolved with `$lookup` (null for singles). */
export type SongWithAlbumTitle = Lean<Song> & { albumTitle: string | null };

// `_id` is the tiebreaker so pages never overlap or skip rows.
const SORTS: Record<SongSort, Record<string, 1 | -1>> = {
	newest: { createdAt: -1, _id: -1 },
	oldest: { createdAt: 1, _id: 1 },
	title: { title: 1, _id: 1 },
	popular: { playCount: -1, _id: 1 },
};

// Case-insensitive title ordering; other sorts are numeric/date and need no collation.
const TITLE_COLLATION = { locale: "en", strength: 2 } as const;

export const WITH_ALBUM_TITLE: PipelineStage.FacetPipelineStage[] = [
	{
		$lookup: {
			from: ALBUMS_COLLECTION,
			localField: "albumId",
			foreignField: "_id",
			pipeline: [{ $project: { title: 1 } }],
			as: "album",
		},
	},
	{ $set: { albumTitle: { $ifNull: [{ $first: "$album.title" }, null] } } },
	{ $unset: ["album", "imagePublicId", "audioPublicId", "__v"] },
];

@Injectable()
export class SongsRepository extends BaseRepository<Song> {
	constructor(@InjectModel(Song.name) model: Model<Song>) {
		super(model);
	}

	/** One aggregation: filter, sort, page, total count and album titles for the page rows only. */
	async list(query: SongListQuery): Promise<Paginated<SongWithAlbumTitle>> {
		const page = clampPage(query.page);
		const limit = clampLimit(query.limit);
		const sort = query.sort ?? "newest";

		const match: QueryFilter<Song> = {};
		if (query.albumId) match.albumId = new Types.ObjectId(query.albumId);
		if (query.q) {
			const regex = { $regex: escapeRegex(query.q), $options: "i" };
			match.$or = [{ title: regex }, { artist: regex }];
		}

		const [result] = await this.model.aggregate<FacetResult<SongWithAlbumTitle>>(
			[{ $match: match }, { $sort: SORTS[sort] }, facetPage(page, limit, WITH_ALBUM_TITLE)],
			sort === "title" ? { collation: TITLE_COLLATION } : {},
		);
		return toPaginated(result, page, limit);
	}

	/** Atomically bumps the counter; resolves to whether the song exists. */
	async incrementPlayCount(id: string | Types.ObjectId): Promise<boolean> {
		const result = await this.model.updateOne({ _id: id }, { $inc: { playCount: 1 } });
		return result.matchedCount > 0;
	}

	async findByIdWithAlbum(id: string): Promise<SongWithAlbumTitle | null> {
		const [song] = await this.model.aggregate<SongWithAlbumTitle>([
			{ $match: { _id: new Types.ObjectId(id) } },
			...WITH_ALBUM_TITLE,
		]);
		return song ?? null;
	}
}
