import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import {
	NAME_MAX_LENGTH,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	type RegisterRequest,
} from "../../../contracts/index.js";

const EMAIL_MAX_LENGTH = 254;

export const normalizeEmail = ({ value }: { value: unknown }): unknown =>
	typeof value === "string" ? value.trim().toLowerCase() : value;

export class RegisterDto implements RegisterRequest {
	@ApiProperty({ maxLength: NAME_MAX_LENGTH, example: "Ada Lovelace" })
	@Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(NAME_MAX_LENGTH)
	name!: string;

	@ApiProperty({ example: "ada@example.com" })
	@Transform(normalizeEmail)
	@IsEmail()
	@MaxLength(EMAIL_MAX_LENGTH)
	email!: string;

	@ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH, format: "password" })
	@IsString()
	@MinLength(PASSWORD_MIN_LENGTH)
	@MaxLength(PASSWORD_MAX_LENGTH)
	password!: string;
}
