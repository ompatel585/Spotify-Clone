import { Injectable, NotFoundException } from "@nestjs/common";
import type { Album, AlbumWithTracks, Paginated } from "../../contracts/index.js";
import { AlbumsRepository } from "./albums.repository.js";
import type { AlbumQueryDto } from "./dto/album-query.dto.js";
import { toAlbum, toAlbumWithTracks } from "./mappers/album.mapper.js";

@Injectable()
export class AlbumsService {
	constructor(private readonly albums: AlbumsRepository) {}

	async list(query: AlbumQueryDto): Promise<Paginated<Album>> {
		const result = await this.albums.list(query);
		return { ...result, items: result.items.map(toAlbum) };
	}

	async getWithTracks(id: string): Promise<AlbumWithTracks> {
		const album = await this.albums.findWithTracks(id);
		if (!album) throw new NotFoundException(`Album ${id} not found`);
		return toAlbumWithTracks(album);
	}
}
