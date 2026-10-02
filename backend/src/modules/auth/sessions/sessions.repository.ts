import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { BaseRepository, type Lean } from "../../../common/repositories/base.repository.js";
import { Session } from "./session.schema.js";

export interface NewSession {
	userId: string;
	family: string;
	tokenHash: string;
	expiresAt: Date;
	userAgent?: string;
	ip?: string;
}

export interface RotationInput {
	family: string;
	userId: string;
	presentedHash: string;
	newHash: string;
	now: Date;
	expiresAt: Date;
}

@Injectable()
export class SessionsRepository extends BaseRepository<Session> {
	constructor(@InjectModel(Session.name) model: Model<Session>) {
		super(model);
	}

	start(input: NewSession): Promise<Lean<Session>> {
		return this.create({
			...input,
			userId: new Types.ObjectId(input.userId),
			revokedAt: null,
			lastUsedAt: new Date(),
		});
	}

	findByFamily(family: string): Promise<Lean<Session> | null> {
		return this.findOne({ family });
	}

	/**
	 * Atomic compare-and-swap: only the request presenting the session's current token hash can
	 * rotate it, so of two concurrent refreshes exactly one wins. Resolves to null when the
	 * presented token is not the current one (stale, revoked or expired session).
	 */
	rotate(input: RotationInput): Promise<Lean<Session> | null> {
		return this.model
			.findOneAndUpdate(
				{
					family: input.family,
					userId: input.userId,
					tokenHash: input.presentedHash,
					revokedAt: null,
					expiresAt: { $gt: input.now },
				},
				{
					$set: {
						tokenHash: input.newHash,
						prevTokenHash: input.presentedHash,
						rotatedAt: input.now,
						lastUsedAt: input.now,
						expiresAt: input.expiresAt,
					},
				},
				{ returnDocument: "after" },
			)
			.lean<Lean<Session>>()
			.exec();
	}

	async revokeFamily(family: string, now = new Date()): Promise<void> {
		await this.model.updateOne({ family, revokedAt: null }, { $set: { revokedAt: now } }).exec();
	}

	async revokeAllForUser(userId: string, now = new Date()): Promise<void> {
		await this.model.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: now } }).exec();
	}
}
