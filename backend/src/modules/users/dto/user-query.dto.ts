import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
import { SEARCH_MAX_LENGTH, type UserListQuery } from "../../../contracts/index.js";

export class UserQueryDto extends PaginationQueryDto implements UserListQuery {
	@ApiPropertyOptional({ description: "Case-insensitive name search", maxLength: SEARCH_MAX_LENGTH })
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(SEARCH_MAX_LENGTH)
	q?: string;
}
