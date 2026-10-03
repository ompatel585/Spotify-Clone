import { ApiProperty } from "@nestjs/swagger";
import type { RecentlyPlayedItem } from "../../../contracts/index.js";
import { SongResponseDto } from "../../songs/dto/song-response.dto.js";

export class RecentlyPlayedItemResponseDto implements RecentlyPlayedItem {
	@ApiProperty({ type: SongResponseDto }) song!: SongResponseDto;
	@ApiProperty({ format: "date-time" }) playedAt!: string;
}
