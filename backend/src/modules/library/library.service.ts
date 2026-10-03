import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import type { LikedSongIdsResponse, Paginated, Song } from "../../contracts/index.js";
import { toSong } from "../songs/mappers/song.mapper.js";
import { SongsRepository } from "../songs/songs.repository.js";
import { LibraryRepository } from "./library.repository.js";

@Injectable()
export class LibraryService {
	constructor(
		private readonly library: LibraryRepository,
		private readonly songs: SongsRepository,
	) {}

	async like(userId: string, songId: string): Promise<void> {
		if (!(await this.songs.exists({ _id: songId }))) throw new NotFoundException(`Song ${songId} not found`);
		await this.library.like(new Types.ObjectId(userId), new Types.ObjectId(songId), new Date());
	}

	/** Idempotent: unliking a song that is not liked (or no longer exists) still succeeds. */
	async unlike(userId: string, songId: string): Promise<void> {
		await this.library.unlike(new Types.ObjectId(userId), new Types.ObjectId(songId));
	}

	async likedSongs(userId: string, page: number, limit: number): Promise<Paginated<Song>> {
		const result = await this.library.likedSongs(new Types.ObjectId(userId), page, limit);
		return { ...result, items: result.items.map(toSong) };
	}

	async likedSongIds(userId: string): Promise<LikedSongIdsResponse> {
		const ids = await this.library.likedSongIds(new Types.ObjectId(userId));
		return { songIds: ids.map((id) => id.toString()) };
	}
}
