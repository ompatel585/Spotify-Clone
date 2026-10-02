import type { CurrentUser } from "./user.types.js";

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	user: CurrentUser;
}

export interface AuthProvidersResponse {
	google: boolean;
}

/** Short-lived token used only to authenticate the socket handshake. */
export interface SocketTicketResponse {
	ticket: string;
	expiresIn: number;
}
