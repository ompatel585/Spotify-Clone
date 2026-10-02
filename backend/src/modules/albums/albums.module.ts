import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AlbumsController } from "./albums.controller.js";
import { AlbumsRepository } from "./albums.repository.js";
import { AlbumsService } from "./albums.service.js";
import { Album, AlbumSchema } from "./schemas/album.schema.js";

// Song data is read through a `$lookup` on the songs collection, so this module never depends on SongsModule.
@Module({
	imports: [MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema }])],
	controllers: [AlbumsController],
	providers: [AlbumsService, AlbumsRepository],
	exports: [AlbumsService, AlbumsRepository],
})
export class AlbumsModule {}
