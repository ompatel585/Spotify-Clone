import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, PipelineStage } from "mongoose";
import { escapeRegex } from "../../common/utils/escape-regex.util.js";
import { type AlbumWithStats, WITH_ALBUM_STATS } from "../albums/albums.repository.js";
import { Album } from "../albums/schemas/album.schema.js";
import { Song } from "../songs/schemas/song.schema.js";
import { type SongWithAlbumTitle, WITH_ALBUM_TITLE } from "../songs/songs.repository.js";

export interface ArtistRow {
	_id: string;
	imageUrl: string;
	songCount: number;
}

/** Case-insensitive patterns for one (already trimmed) query, all built from the escaped input. */
interface Patterns {
	contains: string;
	exact: string;
	prefix: string;
	wordPrefix: string;
}

function patternsFor(query: string): Patterns {
	const q = escapeRegex(query);
	return { contains: q, exact: `^${q}$`, prefix: `^${q}`, wordPrefix: `(?:^|\\W)${q}` };
}

const matches = (field: string, regex: string) => ({
	$regexMatch: { input: field, regex, options: "i" },
});

/** 0 exact title, 1 title starts with, 2 a word of the title or artist starts with, 3 contains. */
function relevance(p: Patterns, primary: string, secondary?: string): Record<string, unknown> {
	const word = [matches(primary, p.wordPrefix), ...(secondary ? [matches(secondary, p.wordPrefix)] : [])];
	// Array-form `$cond` (if, then, else) keeps the pipeline free of thenable `then` keys.
	return {
		$cond: [
			matches(primary, p.exact),
			0,
			{ $cond: [matches(primary, p.prefix), 1, { $cond: [{ $or: word }, 2, 3] }] },
		],
	};
}

/** Each search list is a single aggregation (match, rank, limit, then joins on the kept rows only). */
@Injectable()
export class SearchRepository {
	constructor(
		@InjectModel(Song.name) private readonly songs: Model<Song>,
		@InjectModel(Album.name) private readonly albums: Model<Album>,
	) {}

	searchSongs(query: string, limit: number): Promise<SongWithAlbumTitle[]> {
		const p = patternsFor(query);
		const regex = { $regex: p.contains, $options: "i" };
		return this.songs.aggregate<SongWithAlbumTitle>([
			{ $match: { $or: [{ title: regex }, { artist: regex }] } },
			{ $set: { rank: relevance(p, "$title", "$artist") } },
			{ $sort: { rank: 1, playCount: -1, _id: 1 } },
			{ $limit: limit },
			{ $unset: "rank" },
			...WITH_ALBUM_TITLE,
		]);
	}

	searchAlbums(query: string, limit: number): Promise<AlbumWithStats[]> {
		const p = patternsFor(query);
		const regex = { $regex: p.contains, $options: "i" };
		return this.albums.aggregate<AlbumWithStats>([
			{ $match: { $or: [{ title: regex }, { artist: regex }] } },
			{ $set: { rank: relevance(p, "$title", "$artist") } },
			{ $sort: { rank: 1, releaseYear: -1, _id: 1 } },
			{ $limit: limit },
			{ $unset: "rank" },
			...WITH_ALBUM_STATS,
		]);
	}

	/** Distinct artists whose name matches; the image comes from their most played song. */
	searchArtists(query: string, limit: number): Promise<ArtistRow[]> {
		const p = patternsFor(query);
		const pipeline: PipelineStage[] = [
			{ $match: { artist: { $regex: p.contains, $options: "i" } } },
			{ $sort: { playCount: -1, _id: 1 } },
			{
				$group: {
					_id: "$artist",
					imageUrl: { $first: "$imageUrl" },
					songCount: { $sum: 1 },
					plays: { $sum: "$playCount" },
				},
			},
			{ $set: { rank: relevance(p, "$_id") } },
			{ $sort: { rank: 1, plays: -1, _id: 1 } },
			{ $limit: limit },
			{ $project: { _id: 1, imageUrl: 1, songCount: 1 } },
		];
		return this.songs.aggregate<ArtistRow>(pipeline);
	}
}
