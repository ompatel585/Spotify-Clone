import { ApiProperty } from "@nestjs/swagger";
import type { Album, AlbumWithTracks } from "../../../contracts/index.js";
import { SongResponseDto } from "../../songs/dto/song-response.dto.js";

/** Swagger models for the `Album` / `AlbumWithTracks` contract types. */
export class AlbumResponseDto implements Album {
	@ApiProperty() id!: string;
	@ApiProperty() title!: string;
	@ApiProperty() artist!: string;
	@ApiProperty() imageUrl!: string;
	@ApiProperty() releaseYear!: number;
	@ApiProperty() songCount!: number;
	@ApiProperty({ description: "Seconds" }) totalDuration!: number;
	@ApiProperty({ format: "date-time" }) createdAt!: string;
}

export class AlbumWithTracksResponseDto extends AlbumResponseDto implements AlbumWithTracks {
	@ApiProperty({ type: [SongResponseDto], description: "Ordered by track number, then creation time" })
	songs!: SongResponseDto[];
}
