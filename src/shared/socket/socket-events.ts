import type { ChatMessage, MarkReadResult, SendMessageRequest } from "../types/chat.types.js";
import type {
	ActivityUpdatedPayload,
	MarkReadPayload,
	PresenceSnapshot,
	SocketAck,
	TypingPayload,
	TypingUpdatePayload,
	UpdateActivityPayload,
	UserIdPayload,
} from "./socket-payloads.js";

/** Events the server emits. */
export interface ServerToClientEvents {
	"presence:snapshot": (snapshot: PresenceSnapshot) => void;
	"presence:online": (payload: UserIdPayload) => void;
	"presence:offline": (payload: UserIdPayload) => void;
	"activity:updated": (payload: ActivityUpdatedPayload) => void;
	"message:new": (message: ChatMessage) => void;
	"message:read": (payload: MarkReadResult) => void;
	"typing:update": (payload: TypingUpdatePayload) => void;
	"error:socket": (payload: { message: string }) => void;
}

/** Events the client emits. */
export interface ClientToServerEvents {
	"activity:update": (payload: UpdateActivityPayload) => void;
	"message:send": (payload: SendMessageRequest, ack: (res: SocketAck<ChatMessage>) => void) => void;
	"message:read": (payload: MarkReadPayload, ack?: (res: SocketAck<MarkReadResult>) => void) => void;
	"typing:start": (payload: TypingPayload) => void;
	"typing:stop": (payload: TypingPayload) => void;
}

/** Data attached to every authenticated socket on the server. */
export interface SocketData {
	userId: string;
	role: string;
}

export const SOCKET_PATH = "/socket.io";

/** Room naming shared by both sides: every socket of a user joins this room. */
export const userRoom = (userId: string): string => `user:${userId}`;
