import { Injectable } from "@nestjs/common";

/**
 * Which users are online: `userId -> Set<socketId>`, so several tabs count as one user.
 * In memory for a single instance; with a Redis adapter this map would move to Redis.
 */
@Injectable()
export class PresenceService {
	private readonly sockets = new Map<string, Set<string>>();

	/** Resolves to true when this is the user's first socket (they just came online). */
	add(userId: string, socketId: string): boolean {
		const existing = this.sockets.get(userId);
		if (existing) {
			existing.add(socketId);
			return false;
		}
		this.sockets.set(userId, new Set([socketId]));
		return true;
	}

	/** Resolves to true when this was the user's last socket (they just went offline). */
	remove(userId: string, socketId: string): boolean {
		const existing = this.sockets.get(userId);
		if (!existing?.delete(socketId)) return false;
		if (existing.size > 0) return false;
		this.sockets.delete(userId);
		return true;
	}

	isOnline(userId: string): boolean {
		return this.sockets.has(userId);
	}

	onlineUserIds(): string[] {
		return [...this.sockets.keys()];
	}
}
