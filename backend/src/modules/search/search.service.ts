import { Injectable } from "@nestjs/common";
import type { SearchResults } from "../../contracts/index.js";
import { toAlbum } from "../albums/mappers/album.mapper.js";
import { toSong } from "../songs/mappers/song.mapper.js";
import { SearchRepository } from "./search.repository.js";

@Injectable()
export class SearchService {
	constructor(private readonly repository: SearchRepository) {}

	/** `query` arrives trimmed and non-empty (validated by the DTO). The three lists run in parallel. */
	async search(query: string, limit: number): Promise<SearchResults> {
		const [songs, albums, artists] = await Promise.all([
			this.repository.searchSongs(query, limit),
			this.repository.searchAlbums(query, limit),
			this.repository.searchArtists(query, limit),
		]);
		return {
			query,
			songs: songs.map(toSong),
			albums: albums.map(toAlbum),
			artists: artists.map((artist) => ({
				name: artist._id,
				imageUrl: artist.imageUrl,
				songCount: artist.songCount,
			})),
		};
	}
}
