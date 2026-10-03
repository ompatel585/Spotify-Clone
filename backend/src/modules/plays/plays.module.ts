import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SongsModule } from "../songs/songs.module.js";
import { PlaysController } from "./plays.controller.js";
import { PlaysRepository } from "./plays.repository.js";
import { PlaysService } from "./plays.service.js";
import { PlayEvent, PlayEventSchema } from "./schemas/play-event.schema.js";
import { PlayMarker, PlayMarkerSchema } from "./schemas/play-marker.schema.js";

@Module({
	imports: [
		SongsModule,
		MongooseModule.forFeature([
			{ name: PlayEvent.name, schema: PlayEventSchema },
			{ name: PlayMarker.name, schema: PlayMarkerSchema },
		]),
	],
	controllers: [PlaysController],
	providers: [PlaysService, PlaysRepository],
	exports: [PlaysService, PlaysRepository],
})
export class PlaysModule {}
