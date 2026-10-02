import { Injectable } from "@nestjs/common";
import type { Lean } from "../../common/repositories/base.repository.js";
import { type CurrentUser, type Paginated, type PublicUser, UserRole } from "../../contracts/index.js";
import type { UpdateProfileDto } from "./dto/update-profile.dto.js";
import type { UserQueryDto } from "./dto/user-query.dto.js";
import { toCurrentUser, toPublicUser } from "./mappers/user.mapper.js";
import type { User } from "./schemas/user.schema.js";
import { UsersRepository } from "./users.repository.js";

export interface NewUser {
	email: string;
	name: string;
	passwordHash?: string;
	googleId?: string;
	avatarUrl?: string | null;
	role: UserRole;
}

@Injectable()
export class UsersService {
	constructor(private readonly users: UsersRepository) {}

	/** One lean read; used by the JWT guard on every authenticated request. */
	async findCurrentById(id: string): Promise<CurrentUser | null> {
		const user = await this.users.findById(id);
		return user ? toCurrentUser(user) : null;
	}

	findByEmail(email: string): Promise<Lean<User> | null> {
		return this.users.findByEmail(email);
	}

	findByEmailWithPassword(email: string): Promise<Lean<User> | null> {
		return this.users.findByEmailWithPassword(email);
	}

	findByGoogleId(googleId: string): Promise<Lean<User> | null> {
		return this.users.findByGoogleId(googleId);
	}

	create(data: NewUser): Promise<Lean<User>> {
		return this.users.create(data);
	}

	promoteToAdmin(id: string): Promise<Lean<User> | null> {
		return this.users.updateById(id, { $set: { role: UserRole.Admin } });
	}

	linkGoogle(id: string, googleId: string, avatarUrl: string | null): Promise<Lean<User> | null> {
		return this.users.updateById(id, { $set: { googleId, ...(avatarUrl && { avatarUrl }) } });
	}

	async updateProfile(id: string, dto: UpdateProfileDto): Promise<CurrentUser | null> {
		const changes: Partial<Pick<User, "name" | "avatarUrl">> = {};
		if (dto.name !== undefined) changes.name = dto.name;
		if (dto.avatarUrl !== undefined) changes.avatarUrl = dto.avatarUrl;
		const user = Object.keys(changes).length
			? await this.users.updateById(id, { $set: changes })
			: await this.users.findById(id);
		return user ? toCurrentUser(user) : null;
	}

	async listPeople(me: string, query: UserQueryDto): Promise<Paginated<PublicUser>> {
		const result = await this.users.search(query.q, me, query.page, query.limit);
		return { ...result, items: result.items.map(toPublicUser) };
	}
}
