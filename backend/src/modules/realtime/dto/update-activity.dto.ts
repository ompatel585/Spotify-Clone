import { IsMongoId, ValidateIf } from "class-validator";
import type { UpdateActivityPayload } from "../../../contracts/index.js";

/** `songId` must be present: an ObjectId while playing, `null` when idle. Other fields are stripped. */
export class UpdateActivityDto implements UpdateActivityPayload {
	@ValidateIf((dto: UpdateActivityDto) => dto.songId !== null)
	@IsMongoId()
	songId!: string | null;
}
