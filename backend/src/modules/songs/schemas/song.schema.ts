import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export const SONGS_COLLECTION = "songs";

@Schema({ timestamps: true, collection: SONGS_COLLECTION })
export class Song {
	@Prop({ type: String, required: true, trim: true })
	title!: string;

	@Prop({ type: String, required: true, trim: true })
	artist!: string;

	/** Null for singles. */
	@Prop({ type: Types.ObjectId, ref: "Album", default: null })
	albumId!: Types.ObjectId | null;

	@Prop({ type: Number, min: 1, default: null })
	trackNumber!: number | null;

	@Prop({ type: String, required: true })
	imageUrl!: string;

	/** Set only for Cloudinary-hosted media; never exposed by the API. */
	@Prop({ type: String })
	imagePublicId?: string;

	@Prop({ type: String, required: true })
	audioUrl!: string;

	@Prop({ type: String })
	audioPublicId?: string;

	/** Seconds. */
	@Prop({ type: Number, required: true, min: 1 })
	duration!: number;

	@Prop({ type: Number, required: true, min: 0, default: 0 })
	playCount!: number;

	createdAt!: Date;
	updatedAt!: Date;
}

export const SongSchema = SchemaFactory.createForClass(Song);
SongSchema.index({ title: "text", artist: "text" });
SongSchema.index({ albumId: 1, trackNumber: 1 });
SongSchema.index({ createdAt: -1 });
SongSchema.index({ playCount: -1 });
