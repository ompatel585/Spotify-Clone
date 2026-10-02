import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, QueryFilter } from "mongoose";
import { BaseRepository, type Lean } from "../../common/repositories/base.repository.js";
import { escapeRegex } from "../../common/utils/escape-regex.util.js";
import type { Paginated } from "../../contracts/index.js";
import { User } from "./schemas/user.schema.js";

@Injectable()
export class UsersRepository extends BaseRepository<User> {
	constructor(@InjectModel(User.name) model: Model<User>) {
		super(model);
	}

	/** Includes `passwordHash`, which is excluded from every other read. */
	findByEmailWithPassword(email: string): Promise<Lean<User> | null> {
		return this.model.findOne({ email }).select("+passwordHash").lean<Lean<User>>().exec();
	}

	findByEmail(email: string): Promise<Lean<User> | null> {
		return this.findOne({ email });
	}

	findByGoogleId(googleId: string): Promise<Lean<User> | null> {
		return this.findOne({ googleId });
	}

	search(
		query: string | undefined,
		excludeId: string,
		page: number | undefined,
		limit: number | undefined,
	): Promise<Paginated<Lean<User>>> {
		const filter: QueryFilter<User> = { _id: { $ne: excludeId } };
		if (query) filter.name = { $regex: escapeRegex(query), $options: "i" };
		return this.paginate(filter, { page, limit, sort: { name: 1, _id: 1 } });
	}
}
