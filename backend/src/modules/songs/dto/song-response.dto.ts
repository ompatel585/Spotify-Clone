import { ApiProperty } from "@nestjs/swagger";
import type { Song } from "../../../contracts/index.js";

/** Swagger model for the `Song` contract type. */
export class SongResponseDto implements Song {
	@ApiProperty() id!: string;
	@ApiProperty() title!: string;
	@ApiProperty() artist!: string;
	@ApiProperty({ type: String, nullable: true }) albumId!: string | null;
	@ApiProperty({ type: String, nullable: true }) albumTitle!: string | null;
	@ApiProperty({ type: Number, nullable: true }) trackNumber!: number | null;
	@ApiProperty() imageUrl!: string;
	@ApiProperty() audioUrl!: string;
	@ApiProperty({ description: "Seconds" }) duration!: number;
	@ApiProperty() playCount!: number;
	@ApiProperty({ format: "date-time" }) createdAt!: string;
}
