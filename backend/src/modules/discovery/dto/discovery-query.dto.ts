import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { SECTION_SIZE } from "../../../contracts/index.js";

export const DISCOVERY_MAX_LIMIT = 50;

export class DiscoveryQueryDto {
	@ApiPropertyOptional({ minimum: 1, maximum: DISCOVERY_MAX_LIMIT, default: SECTION_SIZE })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(DISCOVERY_MAX_LIMIT)
	limit: number = SECTION_SIZE;
}
