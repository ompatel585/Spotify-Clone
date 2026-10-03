import type { INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import type { ServerOptions } from "socket.io";
import { type AppConfig, appConfig } from "../../../config/index.js";
import { TokenService } from "../../auth/services/token.service.js";
import { SessionsRepository } from "../../auth/sessions/sessions.repository.js";
import { UsersService } from "../../users/users.service.js";
import {
	SOCKET_MAX_HTTP_BUFFER_BYTES,
	SOCKET_PATH,
	SOCKET_PING_INTERVAL_MS,
	SOCKET_PING_TIMEOUT_MS,
} from "../constants/realtime.constants.js";
import type { RealtimeServer } from "../interfaces/authenticated-socket.interface.js";
import { createSocketAuthMiddleware } from "../middleware/socket-auth.middleware.js";

/**
 * Socket.io on the API's HTTP server: CORS for the web origin, ping and buffer limits, and the ticket
 * auth middleware on every handshake. Gateway decorator options are deliberately ignored so every
 * gateway shares these settings.
 *
 * Horizontal scaling: presence and activity live in memory (single instance). To run several API
 * instances, call `server.adapter(createAdapter(pubClient, subClient))` from `@socket.io/redis-adapter`
 * here and move PresenceService/ActivityService state to Redis.
 */
export class AuthenticatedIoAdapter extends IoAdapter {
	constructor(private readonly app: INestApplicationContext) {
		super(app);
	}

	override createIOServer(port: number, _options?: ServerOptions): RealtimeServer {
		const config = this.app.get<AppConfig>(appConfig.KEY);
		const options: Partial<ServerOptions> = {
			path: SOCKET_PATH,
			cors: { origin: config.webOrigin, credentials: true, methods: ["GET", "POST"] },
			pingInterval: SOCKET_PING_INTERVAL_MS,
			pingTimeout: SOCKET_PING_TIMEOUT_MS,
			maxHttpBufferSize: SOCKET_MAX_HTTP_BUFFER_BYTES,
			serveClient: false,
			// `connectionStateRecovery` stays off: recovered sessions would skip the auth middleware, and
			// clients rebuild state from the `presence:snapshot` sent on every connect.
		};
		// IoAdapter creates an untyped Server; the event maps are compile-time only.
		const server = super.createIOServer(port, options as ServerOptions) as RealtimeServer;
		server.use(
			createSocketAuthMiddleware({
				tokens: this.app.get(TokenService, { strict: false }),
				users: this.app.get(UsersService, { strict: false }),
				sessions: this.app.get(SessionsRepository, { strict: false }),
			}),
		);
		return server;
	}
}
