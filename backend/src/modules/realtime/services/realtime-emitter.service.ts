import { Injectable } from "@nestjs/common";
import type { ServerToClientEvents } from "../../../contracts/index.js";
import { userRoom } from "../constants/realtime.constants.js";
import type { RealtimeServer } from "../interfaces/authenticated-socket.interface.js";
import { PresenceService } from "./presence.service.js";

/** Lets any module (e.g. chat) push events to every open tab of a user without touching the gateway. */
@Injectable()
export class RealtimeEmitterService {
	private server: RealtimeServer | null = null;

	constructor(private readonly presence: PresenceService) {}

	/** Called once by the gateway when Socket.io is ready. */
	attach(server: RealtimeServer): void {
		this.server = server;
	}

	emitToUser<E extends keyof ServerToClientEvents>(
		userId: string,
		event: E,
		...args: Parameters<ServerToClientEvents[E]>
	): void {
		this.server?.to(userRoom(userId)).emit(event, ...args);
	}

	isOnline(userId: string): boolean {
		return this.presence.isOnline(userId);
	}
}
