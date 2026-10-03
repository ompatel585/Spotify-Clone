import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import type { RecordPlayRequest } from "../../../contracts/index.js";

export class RecordPlayDto implements RecordPlayRequest {
	@ApiProperty({ description: "The song that was played" })
	@IsMongoId()
	songId!: string;
}
