import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { SongsModule } from "../songs/songs.module.js";
import { UsersModule } from "../users/users.module.js";
import { PresenceGateway } from "./gateways/presence.gateway.js";
import { ActivityService } from "./services/activity.service.js";
import { PresenceService } from "./services/presence.service.js";
import { RealtimeEmitterService } from "./services/realtime-emitter.service.js";

@Module({
	imports: [AuthModule, UsersModule, SongsModule],
	providers: [PresenceGateway, PresenceService, ActivityService, RealtimeEmitterService],
	exports: [RealtimeEmitterService],
})
export class RealtimeModule {}
