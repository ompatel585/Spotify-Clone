import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, type PipelineStage, type QueryFilter, Types } from "mongoose";
import { BaseRepository, type Lean } from "../../common/repositories/base.repository.js";
import { escapeRegex } from "../../common/utils/escape-regex.util.js";
import { type FacetResult, facetPage, toPaginated } from "../../common/utils/facet-page.util.js";
import { clampLimit, clampPage } from "../../common/utils/pagination.util.js";
import type { AlbumListQuery, Paginated } from "../../contracts/index.js";
import { SONGS_COLLECTION, type Song } from "../songs/schemas/song.schema.js";
import { Album } from "./schemas/album.schema.js";

/** A lean album plus aggregates over its songs. */
export type AlbumWithStats = Lean<Album> & { songCount: number; totalDuration: number };
export type AlbumWithSongs = AlbumWithStats & { songs: Lean<Song>[] };

// Counting inside the `$lookup` pipeline keeps it to one query for the whole page (no per-album reads).
const WITH_STATS: PipelineStage.FacetPipelineStage[] = [
	{
		$lookup: {
			from: SONGS_COLLECTION,
			localField: "_id",
			foreignField: "albumId",
			pipeline: [{ $group: { _id: null, songCount: { $sum: 1 }, totalDuration: { $sum: "$duration" } } }],
			as: "stats",
		},
	},
	{
		$set: {
			songCount: { $ifNull: [{ $first: "$stats.songCount" }, 0] },
			totalDuration: { $ifNull: [{ $first: "$stats.totalDuration" }, 0] },
		},
	},
	{ $unset: ["stats", "imagePublicId", "__v"] },
];

@Injectable()
export class AlbumsRepository extends BaseRepository<Album> {
	constructor(@InjectModel(Album.name) model: Model<Album>) {
		super(model);
	}

	/** One aggregation: filter, sort, page, total count and song stats for the page rows only. */
	async list(query: AlbumListQuery): Promise<Paginated<AlbumWithStats>> {
		const page = clampPage(query.page);
		const limit = clampLimit(query.limit);

		const match: QueryFilter<Album> = {};
		if (query.q) {
			const regex = { $regex: escapeRegex(query.q), $options: "i" };
			match.$or = [{ title: regex }, { artist: regex }];
		}

		const [result] = await this.model.aggregate<FacetResult<AlbumWithStats>>([
			{ $match: match },
			{ $sort: { createdAt: -1, _id: -1 } },
			facetPage(page, limit, WITH_STATS),
		]);
		return toPaginated(result, page, limit);
	}

	/** The album with its songs in track order, in a single aggregation. */
	async findWithTracks(id: string): Promise<AlbumWithSongs | null> {
		const [album] = await this.model.aggregate<AlbumWithSongs>([
			{ $match: { _id: new Types.ObjectId(id) } },
			{
				$lookup: {
					from: SONGS_COLLECTION,
					localField: "_id",
					foreignField: "albumId",
					pipeline: [
						{ $sort: { trackNumber: 1, createdAt: 1, _id: 1 } },
						{ $unset: ["imagePublicId", "audioPublicId", "__v"] },
					],
					as: "songs",
				},
			},
			{ $set: { songCount: { $size: "$songs" }, totalDuration: { $sum: "$songs.duration" } } },
			{ $unset: ["imagePublicId", "__v"] },
		]);
		return album ?? null;
	}
}
