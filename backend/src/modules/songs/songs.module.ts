import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Song, SongSchema } from "./schemas/song.schema.js";
import { SongsController } from "./songs.controller.js";
import { SongsRepository } from "./songs.repository.js";
import { SongsService } from "./songs.service.js";

@Module({
	imports: [MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }])],
	controllers: [SongsController],
	providers: [SongsService, SongsRepository],
	exports: [SongsService, SongsRepository],
})
export class SongsModule {}
