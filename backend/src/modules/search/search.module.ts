import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Album, AlbumSchema } from "../albums/schemas/album.schema.js";
import { Song, SongSchema } from "../songs/schemas/song.schema.js";
import { SearchController } from "./search.controller.js";
import { SearchRepository } from "./search.repository.js";
import { SearchService } from "./search.service.js";

// Read-only: the song/album models are registered here (same schema objects, reused by Mongoose)
// rather than importing their modules, so the module graph stays acyclic.
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Song.name, schema: SongSchema },
			{ name: Album.name, schema: AlbumSchema },
		]),
	],
	controllers: [SearchController],
	providers: [SearchService, SearchRepository],
})
export class SearchModule {}
