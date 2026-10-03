export { SOCKET_PATH, userRoom } from "../../../contracts/index.js";

/** How often the server pings and how long it waits for a pong before dropping the socket. */
export const SOCKET_PING_INTERVAL_MS = 25_000;
export const SOCKET_PING_TIMEOUT_MS = 20_000;
/** Largest accepted frame. Activity and chat payloads are tiny; this caps abuse. */
export const SOCKET_MAX_HTTP_BUFFER_BYTES = 64 * 1024;
/** Tickets are short JWTs; anything longer is rejected before verification. */
export const SOCKET_TICKET_MAX_LENGTH = 2048;

/** Per-socket `activity:update` budget: at most this many events per window; extra ones are dropped. */
export const ACTIVITY_THROTTLE_LIMIT = 5;
export const ACTIVITY_THROTTLE_WINDOW_MS = 1000;

/**
 * Sockets authenticate once at handshake. Every interval the gateway re-checks each online user
 * (still exists, still has an active session) and disconnects the ones that fail, so
 * "log out of all devices" and account deletion end open sockets within this window.
 */
export const SOCKET_REVALIDATE_INTERVAL_MS = 60_000;

export const SOCKET_UNAUTHORIZED = "unauthorized";
