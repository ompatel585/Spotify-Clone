import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { type LoginRequest, PASSWORD_MAX_LENGTH } from "../../../contracts/index.js";
import { normalizeEmail } from "./register.dto.js";

export class LoginDto implements LoginRequest {
	@ApiProperty({ example: "ada@example.com" })
	@Transform(normalizeEmail)
	@IsEmail()
	@MaxLength(254)
	email!: string;

	@ApiProperty({ maxLength: PASSWORD_MAX_LENGTH, format: "password" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(PASSWORD_MAX_LENGTH)
	password!: string;
}
