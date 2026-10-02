import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
import { type AlbumListQuery, SEARCH_MAX_LENGTH } from "../../../contracts/index.js";

export class AlbumQueryDto extends PaginationQueryDto implements AlbumListQuery {
	@ApiPropertyOptional({
		description: "Case-insensitive title or artist search",
		maxLength: SEARCH_MAX_LENGTH,
	})
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(SEARCH_MAX_LENGTH)
	q?: string;
}
