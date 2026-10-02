import type { CurrentUser } from "../../../contracts/index.js";

export interface ClientMeta {
	ip?: string;
	userAgent?: string;
}

export interface AuthResult {
	user: CurrentUser;
	accessToken: string;
	/** Absent when the request lost a refresh race: the winner's response carries the new one. */
	refreshToken?: string;
}

export interface GoogleProfile {
	googleId: string;
	email: string;
	name: string;
	avatarUrl: string | null;
}
