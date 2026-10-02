/** What a user is listening to right now. Built server-side from the song id, never trusted from the client. */
export interface Activity {
	songId: string;
	title: string;
	artist: string;
	imageUrl: string;
	startedAt: string;
}

export interface PresenceSnapshot {
	onlineUserIds: string[];
	activities: Record<string, Activity>;
}

export interface UserIdPayload {
	userId: string;
}

export interface ActivityUpdatedPayload {
	userId: string;
	activity: Activity | null;
}

/** Client → server: `songId` null means paused / idle. */
export interface UpdateActivityPayload {
	songId: string | null;
}

/** Client → server: `userId` is the other participant. */
export interface TypingPayload {
	userId: string;
}

export interface TypingUpdatePayload {
	userId: string;
	isTyping: boolean;
}

/** Client → server: mark everything received from `userId` as read. */
export interface MarkReadPayload {
	userId: string;
}

export type SocketAck<T> = { ok: true; data: T } | { ok: false; error: string };
