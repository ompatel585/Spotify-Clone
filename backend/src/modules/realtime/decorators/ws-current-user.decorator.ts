import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { SocketData } from "../../../contracts/index.js";
import type { AuthenticatedSocket } from "../interfaces/authenticated-socket.interface.js";

/** The user the socket authenticated as at handshake (never a client-supplied id). */
export const WsCurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): SocketData =>
		context.switchToWs().getClient<AuthenticatedSocket>().data,
);
