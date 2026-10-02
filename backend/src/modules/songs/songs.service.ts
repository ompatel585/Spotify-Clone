import { Injectable, NotFoundException } from "@nestjs/common";
import type { Paginated, Song } from "../../contracts/index.js";
import type { SongQueryDto } from "./dto/song-query.dto.js";
import { toSong } from "./mappers/song.mapper.js";
import { SongsRepository } from "./songs.repository.js";

@Injectable()
export class SongsService {
	constructor(private readonly songs: SongsRepository) {}

	async list(query: SongQueryDto): Promise<Paginated<Song>> {
		const result = await this.songs.list(query);
		return { ...result, items: result.items.map(toSong) };
	}

	async getById(id: string): Promise<Song> {
		const song = await this.songs.findByIdWithAlbum(id);
		if (!song) throw new NotFoundException(`Song ${id} not found`);
		return toSong(song);
	}
}
