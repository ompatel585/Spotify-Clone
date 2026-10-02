import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configNamespaces } from "../../../config/index.js";
import { AlbumsModule } from "../../../modules/albums/albums.module.js";
import { SongsModule } from "../../../modules/songs/songs.module.js";
import { DatabaseModule } from "../database.module.js";
import { SeedService } from "./seed.service.js";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: configNamespaces }),
		DatabaseModule,
		AlbumsModule,
		SongsModule,
	],
	providers: [SeedService],
})
export class SeedModule {}
