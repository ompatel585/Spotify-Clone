import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from "class-validator";
import { NAME_MAX_LENGTH, type UpdateProfileRequest } from "../../../contracts/index.js";

const AVATAR_URL_MAX_LENGTH = 2048;

export class UpdateProfileDto implements UpdateProfileRequest {
	@ApiPropertyOptional({ maxLength: NAME_MAX_LENGTH })
	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(NAME_MAX_LENGTH)
	name?: string;

	@ApiPropertyOptional({ nullable: true, type: String, description: "https URL, or null to remove" })
	@IsOptional()
	@IsUrl({ protocols: ["https"], require_protocol: true }, { message: "avatarUrl must be an https URL" })
	@MaxLength(AVATAR_URL_MAX_LENGTH)
	avatarUrl?: string | null;
}
