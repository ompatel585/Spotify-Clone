import { ApiProperty } from "@nestjs/swagger";
import type { ArtistSummary, SearchResults } from "../../../contracts/index.js";
import { AlbumResponseDto } from "../../albums/dto/album-response.dto.js";
import { SongResponseDto } from "../../songs/dto/song-response.dto.js";

/** Swagger models for the `ArtistSummary` / `SearchResults` contract types. */
export class ArtistSummaryResponseDto implements ArtistSummary {
	@ApiProperty() name!: string;
	@ApiProperty({ description: "Cover of the artist's most played song" }) imageUrl!: string;
	@ApiProperty() songCount!: number;
}

export class SearchResultsResponseDto implements SearchResults {
	@ApiProperty({ description: "The trimmed query" }) query!: string;
	@ApiProperty({ type: [SongResponseDto] }) songs!: SongResponseDto[];
	@ApiProperty({ type: [AlbumResponseDto] }) albums!: AlbumResponseDto[];
	@ApiProperty({ type: [ArtistSummaryResponseDto] }) artists!: ArtistSummaryResponseDto[];
}
