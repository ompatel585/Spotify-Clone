import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SongsModule } from "../songs/songs.module.js";
import { LibraryController } from "./library.controller.js";
import { LibraryRepository } from "./library.repository.js";
import { LibraryService } from "./library.service.js";
import { Like, LikeSchema } from "./schemas/like.schema.js";

@Module({
	imports: [SongsModule, MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }])],
	controllers: [LibraryController],
	providers: [LibraryService, LibraryRepository],
	exports: [LibraryRepository],
})
export class LibraryModule {}
