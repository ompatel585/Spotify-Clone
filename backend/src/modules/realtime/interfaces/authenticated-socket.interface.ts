import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "../../../contracts/index.js";

/** No inter-server events yet; a Redis adapter would add them here. */
export type InterServerEvents = Record<string, never>;

export type RealtimeServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

/** A socket that passed the handshake middleware: `data.userId` and `data.role` are always set. */
export type AuthenticatedSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;
