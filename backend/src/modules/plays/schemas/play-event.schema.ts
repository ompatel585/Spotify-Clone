import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export const PLAY_EVENTS_COLLECTION = "playevents";
export const PLAY_EVENT_TTL_SECONDS = 180 * 24 * 60 * 60;

@Schema({ collection: PLAY_EVENTS_COLLECTION, versionKey: false })
export class PlayEvent {
	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	userId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "Song", required: true })
	songId!: Types.ObjectId;

	@Prop({ type: Date, required: true, default: () => new Date() })
	playedAt!: Date;
}

export const PlayEventSchema = SchemaFactory.createForClass(PlayEvent);
PlayEventSchema.index({ userId: 1, playedAt: -1 });
PlayEventSchema.index({ songId: 1, playedAt: -1 });
PlayEventSchema.index({ playedAt: 1 }, { expireAfterSeconds: PLAY_EVENT_TTL_SECONDS });
