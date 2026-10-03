import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export const LIKES_COLLECTION = "likes";

@Schema({ collection: LIKES_COLLECTION, versionKey: false })
export class Like {
	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	userId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "Song", required: true })
	songId!: Types.ObjectId;

	@Prop({ type: Date, required: true, default: () => new Date() })
	createdAt!: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ userId: 1, songId: 1 }, { unique: true });
LikeSchema.index({ userId: 1, createdAt: -1 });
