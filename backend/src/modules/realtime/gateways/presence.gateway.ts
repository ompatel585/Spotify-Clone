import { Logger, type OnModuleDestroy, UseFilters, ValidationPipe } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	type OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from "@nestjs/websockets";
import type { SocketData, UpdateActivityPayload } from "../../../contracts/index.js";
import { SessionsRepository } from "../../auth/sessions/sessions.repository.js";
import { UsersService } from "../../users/users.service.js";
import {
	ACTIVITY_THROTTLE_LIMIT,
	ACTIVITY_THROTTLE_WINDOW_MS,
	SOCKET_REVALIDATE_INTERVAL_MS,
	userRoom,
} from "../constants/realtime.constants.js";
import { WsCurrentUser } from "../decorators/ws-current-user.decorator.js";
import { UpdateActivityDto } from "../dto/update-activity.dto.js";
import { WsExceptionFilter } from "../filters/ws-exception.filter.js";
import type { AuthenticatedSocket, RealtimeServer } from "../interfaces/authenticated-socket.interface.js";
import { resolveSocketUser } from "../middleware/socket-auth.middleware.js";
import { ActivityService } from "../services/activity.service.js";
import { PresenceService } from "../services/presence.service.js";
import { RealtimeEmitterService } from "../services/realtime-emitter.service.js";

interface ThrottleWindow {
	startedAt: number;
	count: number;
}

/**
 * Param-level pipe with `expectedType`: the handler parameter is typed with the contract interface,
 * so the global HTTP ValidationPipe (which forbids unknown fields) skips it. Here unknown fields
 * are stripped instead, and only `songId` reaches the handler.
 */
const activityValidation = new ValidationPipe({
	expectedType: UpdateActivityDto,
	whitelist: true,
	transform: true,
	exceptionFactory: () => new WsException("Invalid activity payload"),
});

/**
 * Presence (online / offline, multi-tab aware) and "now playing" activity. Sockets reach this
 * gateway only after the handshake middleware authenticated them (see AuthenticatedIoAdapter).
 */
@WebSocketGateway()
@UseFilters(WsExceptionFilter)
export class PresenceGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
	private readonly logger = new Logger(PresenceGateway.name);
	private readonly throttles = new Map<string, ThrottleWindow>();
	private revalidateTimer: NodeJS.Timeout | null = null;

	@WebSocketServer()
	private readonly server: RealtimeServer;

	constructor(
		private readonly presence: PresenceService,
		private readonly activity: ActivityService,
		private readonly emitter: RealtimeEmitterService,
		private readonly users: UsersService,
		private readonly sessions: SessionsRepository,
	) {}

	afterInit(server: RealtimeServer): void {
		this.emitter.attach(server);
		this.revalidateTimer = setInterval(() => void this.revalidate(), SOCKET_REVALIDATE_INTERVAL_MS);
		this.revalidateTimer.unref();
	}

	onModuleDestroy(): void {
		if (this.revalidateTimer) clearInterval(this.revalidateTimer);
	}

	async handleConnection(socket: AuthenticatedSocket): Promise<void> {
		const { userId } = socket.data;
		await socket.join(userRoom(userId));
		const cameOnline = this.presence.add(userId, socket.id);
		socket.emit("presence:snapshot", {
			onlineUserIds: this.presence.onlineUserIds(),
			activities: this.activity.snapshot(),
		});
		if (cameOnline) socket.broadcast.emit("presence:online", { userId });
	}

	handleDisconnect(socket: AuthenticatedSocket): void {
		this.throttles.delete(socket.id);
		const { userId } = socket.data;
		if (!userId) return;
		if (this.presence.remove(userId, socket.id)) {
			this.activity.clear(userId);
			// Offline implies idle: clients drop the user's activity on this event.
			this.server.emit("presence:offline", { userId });
		}
	}

	@SubscribeMessage("activity:update")
	async onActivityUpdate(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@WsCurrentUser() user: SocketData,
		@MessageBody(activityValidation) body: UpdateActivityPayload,
	): Promise<void> {
		if (this.isThrottled(socket.id)) return;
		const result = await this.activity.update(user.userId, body.songId, () =>
			this.presence.isOnline(user.userId),
		);
		if (result === null) throw new WsException("Song not found");
		if (!result.changed) return;
		socket.broadcast.emit("activity:updated", { userId: user.userId, activity: result.activity });
	}

	/** Fixed window per socket; events over the budget are dropped silently. */
	private isThrottled(socketId: string): boolean {
		const now = Date.now();
		const window = this.throttles.get(socketId);
		if (!window || now - window.startedAt >= ACTIVITY_THROTTLE_WINDOW_MS) {
			this.throttles.set(socketId, { startedAt: now, count: 1 });
			return false;
		}
		window.count += 1;
		return window.count > ACTIVITY_THROTTLE_LIMIT;
	}

	/** Disconnects every socket of users that were deleted or logged out of all devices. */
	private async revalidate(): Promise<void> {
		const deps = { users: this.users, sessions: this.sessions };
		for (const userId of this.presence.onlineUserIds()) {
			try {
				const data = await resolveSocketUser(deps, userId);
				if (!data) {
					this.logger.log(`Disconnecting sockets of user ${userId}: no longer authorized`);
					this.server.in(userRoom(userId)).disconnectSockets(true);
				}
			} catch (error) {
				this.logger.warn(`Socket revalidation failed: ${error instanceof Error ? error.message : error}`);
			}
		}
	}
}
