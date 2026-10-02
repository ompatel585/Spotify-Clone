import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";

const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Rejects anything that is not a 24-char hex ObjectId (Mongoose's own check accepts any 12-char string). */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
	transform(value: string): string {
		if (typeof value !== "string" || !OBJECT_ID.test(value)) {
			throw new BadRequestException({ message: "Invalid id", error: "Bad Request", code: "INVALID_ID" });
		}
		return value;
	}
}
