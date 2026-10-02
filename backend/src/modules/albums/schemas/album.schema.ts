import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export const ALBUMS_COLLECTION = "albums";

@Schema({ timestamps: true, collection: ALBUMS_COLLECTION })
export class Album {
	@Prop({ type: String, required: true, trim: true })
	title!: string;

	@Prop({ type: String, required: true, trim: true })
	artist!: string;

	@Prop({ type: String, required: true })
	imageUrl!: string;

	/** Set only for Cloudinary-hosted covers; never exposed by the API. */
	@Prop({ type: String })
	imagePublicId?: string;

	@Prop({ type: Number, required: true, min: 1900 })
	releaseYear!: number;

	createdAt!: Date;
	updatedAt!: Date;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
AlbumSchema.index({ title: "text", artist: "text" });
AlbumSchema.index({ createdAt: -1 });
