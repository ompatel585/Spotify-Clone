import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PlayEvent, PlayEventSchema } from "../plays/schemas/play-event.schema.js";
import { Song, SongSchema } from "../songs/schemas/song.schema.js";
import { DiscoveryController } from "./discovery.controller.js";
import { DiscoveryRepository } from "./discovery.repository.js";
import { DiscoveryService } from "./discovery.service.js";

// Read-only views over songs and play events: the models are registered here (same schema objects, so
// Mongoose reuses them) instead of importing SongsModule / PlaysModule, keeping the module graph acyclic.
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Song.name, schema: SongSchema },
			{ name: PlayEvent.name, schema: PlayEventSchema },
		]),
	],
	controllers: [DiscoveryController],
	providers: [DiscoveryService, DiscoveryRepository],
})
export class DiscoveryModule {}
