import { ApiProperty } from "@nestjs/swagger";
import type { LikedSongIdsResponse } from "../../../contracts/index.js";

/** Swagger model for the `LikedSongIdsResponse` contract type. */
export class LikedSongIdsResponseDto implements LikedSongIdsResponse {
	@ApiProperty({ type: [String], description: "Every liked song id, newest like first" })
	songIds!: string[];
}
