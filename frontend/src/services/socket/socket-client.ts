import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";
import { publicEnv } from "@/config/env";
import {
	type ClientToServerEvents,
	type ServerToClientEvents,
	SOCKET_PATH,
	type SocketTicketResponse,
} from "@/types/contracts";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** The message the server's handshake middleware rejects a missing, expired or forged ticket with. */
export const UNAUTHORIZED_SOCKET_ERROR = "unauthorized";

let socket: AppSocket | null = null;
/** Last song id sent with `activity:update`; `undefined` = nothing sent on the current connection yet. */
let lastSentActivity: string | null | undefined;

/** A ticket is single-use and lives 60 s, so one is fetched for every (re)connect attempt. */
async function fetchTicket(): Promise<string | null> {
	try {
		const response = await fetch("/api/auth/socket-ticket", { method: "POST", credentials: "include" });
		if (!response.ok) return null;
		const body = (await response.json()) as SocketTicketResponse;
		return typeof body.ticket === "string" ? body.ticket : null;
	} catch {
		return null;
	}
}

function createSocket(): AppSocket {
	const options: Partial<ManagerOptions & SocketOptions> = {
		path: SOCKET_PATH,
		transports: ["websocket"],
		autoConnect: false,
		// Without a ticket the server answers `unauthorized`, which the provider turns into one refresh attempt.
		auth: (cb) => {
			void fetchTicket().then((ticket) => cb(ticket ? { ticket } : {}));
		},
	};
	const url = publicEnv.NEXT_PUBLIC_SOCKET_URL;
	return url ? io(url, options) : io(options);
}

/** The app-wide socket. Created lazily and only in the browser. */
export function getSocket(): AppSocket {
	socket ??= createSocket();
	return socket;
}

export function connectSocket() {
	const instance = getSocket();
	if (!instance.connected) instance.connect();
}

export function disconnectSocket() {
	socket?.disconnect();
	lastSentActivity = undefined;
}

/** Sends the listening state, skipping repeats. A no-op while offline; the provider re-syncs on connect. */
export function emitActivity(songId: string | null) {
	if (!socket?.connected || songId === lastSentActivity) return;
	lastSentActivity = songId;
	socket.emit("activity:update", { songId });
}

/**
 * Called right after each (re)connect. Only an active song is pushed: a fresh connection starts idle on the
 * server, and sending `null` here would wipe what another tab of the same user is playing.
 */
export function resyncActivity(songId: string | null) {
	lastSentActivity = null;
	if (songId) emitActivity(songId);
}
