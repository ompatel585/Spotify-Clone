import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NAME_MAX_LENGTH, UserRole } from "../../../contracts/index.js";

@Schema({ timestamps: true, collection: "users" })
export class User {
	@Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
	email!: string;

	@Prop({ type: String, required: true, trim: true, maxlength: NAME_MAX_LENGTH })
	name!: string;

	/** Absent for Google-only accounts. Never selected unless explicitly requested. */
	@Prop({ type: String, select: false })
	passwordHash?: string;

	@Prop({ type: String, unique: true, sparse: true })
	googleId?: string;

	@Prop({ type: String, default: null })
	avatarUrl!: string | null;

	@Prop({ type: String, enum: Object.values(UserRole), default: UserRole.User })
	role!: UserRole;

	createdAt!: Date;
	updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ name: "text" });
