import type { PublicUser } from "./user.types.js";

export interface ChatMessage {
	id: string;
	conversationId: string;
	senderId: string;
	receiverId: string;
	content: string;
	/** Client-generated id used to reconcile optimistic messages. */
	clientId: string | null;
	createdAt: string;
	readAt: string | null;
}

export interface Conversation {
	id: string;
	participant: PublicUser;
	lastMessage: ChatMessage | null;
	unreadCount: number;
	updatedAt: string;
}

export interface SendMessageRequest {
	receiverId: string;
	content: string;
	clientId: string;
}

export interface MarkReadResult {
	conversationId: string;
	readerId: string;
	readAt: string;
}
