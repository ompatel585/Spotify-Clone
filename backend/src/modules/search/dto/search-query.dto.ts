import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { SEARCH_MAX_LENGTH, type SearchQuery } from "../../../contracts/index.js";

export const SEARCH_DEFAULT_LIMIT = 10;
export const SEARCH_MAX_LIMIT = 25;

export class SearchQueryDto implements SearchQuery {
	@ApiProperty({
		description: "Matched case-insensitively against titles and artists",
		maxLength: SEARCH_MAX_LENGTH,
	})
	@Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(SEARCH_MAX_LENGTH)
	q!: string;

	@ApiPropertyOptional({ minimum: 1, maximum: SEARCH_MAX_LIMIT, default: SEARCH_DEFAULT_LIMIT })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(SEARCH_MAX_LIMIT)
	limit: number = SEARCH_DEFAULT_LIMIT;
}
