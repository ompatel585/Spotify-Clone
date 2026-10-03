import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export const PLAY_MARKERS_COLLECTION = "playmarkers";
const MARKER_TTL_SECONDS = 60 * 60;

/**
 * Per-(user, song) "last counted" marker. A single atomic conditional upsert on it decides whether a
 * play counts, so concurrent duplicates cannot both pass. Disposable: expires an hour after the last play.
 */
@Schema({ collection: PLAY_MARKERS_COLLECTION, versionKey: false })
export class PlayMarker {
	@Prop({ type: Types.ObjectId, required: true })
	userId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, required: true })
	songId!: Types.ObjectId;

	@Prop({ type: Date, required: true })
	lastCountedAt!: Date;
}

export const PlayMarkerSchema = SchemaFactory.createForClass(PlayMarker);
PlayMarkerSchema.index({ userId: 1, songId: 1 }, { unique: true });
PlayMarkerSchema.index({ lastCountedAt: 1 }, { expireAfterSeconds: MARKER_TTL_SECONDS });
