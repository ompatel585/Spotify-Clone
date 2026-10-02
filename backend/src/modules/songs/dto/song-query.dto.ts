import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsMongoId, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
import { SEARCH_MAX_LENGTH, type SongListQuery, type SongSort } from "../../../contracts/index.js";

const SONG_SORTS = ["newest", "oldest", "title", "popular"] as const satisfies readonly SongSort[];

export class SongQueryDto extends PaginationQueryDto implements SongListQuery {
	@ApiPropertyOptional({
		description: "Case-insensitive title or artist search",
		maxLength: SEARCH_MAX_LENGTH,
	})
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(SEARCH_MAX_LENGTH)
	q?: string;

	@ApiPropertyOptional({ description: "Only songs of this album" })
	@IsOptional()
	@IsMongoId()
	albumId?: string;

	@ApiPropertyOptional({ enum: SONG_SORTS, default: "newest" })
	@IsOptional()
	@IsIn(SONG_SORTS)
	sort?: SongSort;
}
