import type { UserRole } from "../constants/roles.js";

/** What other users can see about someone. */
export interface PublicUser {
	id: string;
	name: string;
	avatarUrl: string | null;
}

/** The signed-in user. */
export interface CurrentUser extends PublicUser {
	email: string;
	role: UserRole;
	createdAt: string;
}

export interface UpdateProfileRequest {
	name?: string;
	avatarUrl?: string | null;
}

export interface UserListQuery {
	q?: string;
	page?: number;
	limit?: number;
}
