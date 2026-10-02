import type { Lean } from "../../../common/repositories/base.repository.js";
import type { CurrentUser, PublicUser } from "../../../contracts/index.js";
import type { User } from "../schemas/user.schema.js";

export function toPublicUser(user: Lean<User>): PublicUser {
	return { id: user._id.toString(), name: user.name, avatarUrl: user.avatarUrl ?? null };
}

export function toCurrentUser(user: Lean<User>): CurrentUser {
	return {
		...toPublicUser(user),
		email: user.email,
		role: user.role,
		createdAt: user.createdAt.toISOString(),
	};
}
