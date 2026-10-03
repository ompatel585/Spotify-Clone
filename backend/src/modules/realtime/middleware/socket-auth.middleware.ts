import { Logger, UnauthorizedException } from "@nestjs/common";
import type { ExtendedError } from "socket.io";
import type { SocketData } from "../../../contracts/index.js";
import type { TokenService } from "../../auth/services/token.service.js";
import type { SessionsRepository } from "../../auth/sessions/sessions.repository.js";
import type { UsersService } from "../../users/users.service.js";
import { SOCKET_TICKET_MAX_LENGTH, SOCKET_UNAUTHORIZED } from "../constants/realtime.constants.js";
import type { AuthenticatedSocket } from "../interfaces/authenticated-socket.interface.js";

export interface SocketAuthDeps {
	tokens: TokenService;
	users: UsersService;
	sessions: SessionsRepository;
}

const logger = new Logger("SocketAuth");

/**
 * The user still exists and has at least one live session. Used at handshake and by the gateway's
 * periodic re-check, so "log out of all devices" (which revokes every session) also ends sockets.
 */
export async function resolveSocketUser(
	deps: Pick<SocketAuthDeps, "users" | "sessions">,
	userId: string,
): Promise<SocketData | null> {
	const [user, hasSession] = await Promise.all([
		deps.users.findCurrentById(userId),
		deps.sessions.exists({ userId, revokedAt: null, expiresAt: { $gt: new Date() } }),
	]);
	return user && hasSession ? { userId: user.id, role: user.role } : null;
}

function readTicket(auth: unknown): string | null {
	if (typeof auth !== "object" || auth === null || !("ticket" in auth)) return null;
	const { ticket } = auth;
	return typeof ticket === "string" && ticket.length > 0 && ticket.length <= SOCKET_TICKET_MAX_LENGTH
		? ticket
		: null;
}

/**
 * `io.use` middleware: verifies `handshake.auth.ticket` (from `POST /api/auth/socket-ticket`) and
 * attaches `{ userId, role }` to `socket.data`. Any failure rejects the handshake with "unauthorized",
 * which the client receives as `connect_error`. Ids sent by the client are never read.
 */
export function createSocketAuthMiddleware(deps: SocketAuthDeps) {
	return (socket: AuthenticatedSocket, next: (error?: ExtendedError) => void): void => {
		const ticket = readTicket(socket.handshake.auth);
		if (!ticket) {
			next(new Error(SOCKET_UNAUTHORIZED));
			return;
		}
		let userId: string;
		try {
			userId = deps.tokens.verifySocketTicket(ticket).sub;
		} catch {
			next(new Error(SOCKET_UNAUTHORIZED));
			return;
		}
		resolveSocketUser(deps, userId).then(
			(data) => {
				if (!data) {
					next(new Error(SOCKET_UNAUTHORIZED));
					return;
				}
				socket.data = data;
				next();
			},
			(error: unknown) => {
				if (!(error instanceof UnauthorizedException)) {
					logger.error(error instanceof Error ? error.stack : String(error));
				}
				next(new Error(SOCKET_UNAUTHORIZED));
			},
		);
	};
}
