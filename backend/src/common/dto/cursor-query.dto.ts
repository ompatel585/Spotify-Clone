import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { type CursorQuery, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../contracts/index.js";

export class CursorQueryDto implements CursorQuery {
	@ApiPropertyOptional({ description: "Opaque cursor from the previous page's `nextCursor`" })
	@IsOptional()
	@IsString()
	@MaxLength(200)
	cursor?: string;

	@ApiPropertyOptional({ minimum: 1, maximum: MAX_PAGE_SIZE, default: DEFAULT_PAGE_SIZE })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PAGE_SIZE)
	limit: number = DEFAULT_PAGE_SIZE;
}
