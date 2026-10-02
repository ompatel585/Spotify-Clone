import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, type Types } from "mongoose";

/** One document per device login. `family` identifies the rotation chain of its refresh tokens. */
@Schema({ timestamps: true, collection: "sessions" })
export class Session {
	@Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true, index: true })
	userId!: Types.ObjectId;

	@Prop({ type: String, required: true, unique: true })
	family!: string;

	/** SHA-256 of the current refresh token; the raw token is never stored. */
	@Prop({ type: String, required: true })
	tokenHash!: string;

	/** Hash of the token this one replaced, kept to tell a concurrent refresh from token reuse. */
	@Prop({ type: String })
	prevTokenHash?: string;

	@Prop({ type: Date })
	rotatedAt?: Date;

	@Prop({ type: String })
	userAgent?: string;

	@Prop({ type: String })
	ip?: string;

	@Prop({ type: Date, required: true })
	expiresAt!: Date;

	@Prop({ type: Date, default: null })
	revokedAt!: Date | null;

	@Prop({ type: Date, required: true })
	lastUsedAt!: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
// Mongo deletes the document once expiresAt passes (the TTL monitor runs about once a minute).
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
