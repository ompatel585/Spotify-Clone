import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { RECENTLY_PLAYED_SIZE } from "../../../contracts/index.js";

export const RECENT_PLAYS_MAX = 50;

export class RecentPlaysQueryDto {
	@ApiPropertyOptional({ minimum: 1, maximum: RECENT_PLAYS_MAX, default: RECENTLY_PLAYED_SIZE })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(RECENT_PLAYS_MAX)
	limit: number = RECENTLY_PLAYED_SIZE;
}
