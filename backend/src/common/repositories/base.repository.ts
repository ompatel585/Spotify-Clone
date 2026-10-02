import type {
	ClientSession,
	HydratedDocument,
	Model,
	ProjectionType,
	QueryFilter,
	SortOrder,
	Types,
	UpdateQuery,
} from "mongoose";
import type { Paginated } from "../../contracts/index.js";
import { buildPaginated, clampLimit, clampPage, skipFor } from "../utils/pagination.util.js";

/** A plain (lean) document as returned by reads. */
export type Lean<T> = T & { _id: Types.ObjectId };

export interface ReadOptions {
	session?: ClientSession;
}

export interface FindOptions<T> extends ReadOptions {
	projection?: ProjectionType<T>;
	sort?: Record<string, SortOrder>;
	limit?: number;
	skip?: number;
}

export interface PaginateOptions<T> extends ReadOptions {
	page?: number;
	limit?: number;
	projection?: ProjectionType<T>;
	sort?: Record<string, SortOrder>;
}

/**
 * Thin typed wrapper over a Mongoose model. Reads are always `.lean()` (plain objects, no
 * document hydration); domain repositories extend it and keep every Model reference private.
 */
export abstract class BaseRepository<T> {
	protected constructor(protected readonly model: Model<T>) {}

	findById(id: string | Types.ObjectId, options: FindOptions<T> = {}): Promise<Lean<T> | null> {
		return this.findOne({ _id: id } as QueryFilter<T>, options);
	}

	findOne(filter: QueryFilter<T>, options: FindOptions<T> = {}): Promise<Lean<T> | null> {
		const query = this.model.findOne(filter, options.projection, { session: options.session });
		if (options.sort) query.sort(options.sort);
		return query.lean<Lean<T>>().exec();
	}

	find(filter: QueryFilter<T> = {}, options: FindOptions<T> = {}): Promise<Lean<T>[]> {
		const query = this.model.find(filter, options.projection, { session: options.session });
		if (options.sort) query.sort(options.sort);
		if (options.skip !== undefined) query.skip(options.skip);
		if (options.limit !== undefined) query.limit(options.limit);
		return query.lean<Lean<T>[]>().exec();
	}

	async create(data: Partial<T>, options: ReadOptions = {}): Promise<Lean<T>> {
		const [created] = await this.model.create([data as never], { session: options.session });
		if (!created) throw new Error(`${this.model.modelName}: create returned no document`);
		return (created as HydratedDocument<T>).toObject() as Lean<T>;
	}

	updateById(
		id: string | Types.ObjectId,
		update: UpdateQuery<T>,
		options: ReadOptions = {},
	): Promise<Lean<T> | null> {
		return this.model
			.findByIdAndUpdate(id, update, {
				returnDocument: "after",
				runValidators: true,
				session: options.session,
			})
			.lean<Lean<T>>()
			.exec();
	}

	/** Resolves to whether a document was actually removed. */
	async deleteById(id: string | Types.ObjectId, options: ReadOptions = {}): Promise<boolean> {
		const removed = await this.model.findByIdAndDelete(id, { session: options.session }).lean().exec();
		return removed !== null;
	}

	async exists(filter: QueryFilter<T>, options: ReadOptions = {}): Promise<boolean> {
		const found = await this.model.exists(filter).session(options.session ?? null);
		return found !== null;
	}

	count(filter: QueryFilter<T> = {}, options: ReadOptions = {}): Promise<number> {
		return this.model
			.countDocuments(filter)
			.session(options.session ?? null)
			.exec();
	}

	async paginate(filter: QueryFilter<T> = {}, options: PaginateOptions<T> = {}): Promise<Paginated<Lean<T>>> {
		const page = clampPage(options.page);
		const limit = clampLimit(options.limit);
		const [items, total] = await Promise.all([
			this.find(filter, {
				projection: options.projection,
				sort: options.sort,
				session: options.session,
				skip: skipFor(page, limit),
				limit,
			}),
			this.count(filter, { session: options.session }),
		]);
		return buildPaginated(items, total, page, limit);
	}
}
