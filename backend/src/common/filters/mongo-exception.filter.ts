import {
	type ArgumentsHost,
	BadRequestException,
	Catch,
	ConflictException,
	type ExceptionFilter,
} from "@nestjs/common";
import { Error as MongooseError, mongo } from "mongoose";
import { MONGO_DUPLICATE_KEY_CODE } from "../constants/app.constants.js";
import type { AllExceptionsFilter } from "./all-exceptions.filter.js";

/**
 * Turns well-known database failures into 4xx responses and hands everything else to the
 * generic filter. Duplicate-key values are never echoed back, only the field names.
 */
@Catch(mongo.MongoServerError, MongooseError.CastError, MongooseError.ValidationError)
export class MongoExceptionFilter implements ExceptionFilter {
	constructor(private readonly fallback: AllExceptionsFilter) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		this.fallback.catch(this.translate(exception), host);
	}

	private translate(exception: unknown): unknown {
		if (exception instanceof mongo.MongoServerError && exception.code === MONGO_DUPLICATE_KEY_CODE) {
			const fields = Object.keys(exception.keyPattern ?? exception.keyValue ?? {});
			return new ConflictException({
				message: fields.length ? `${fields.join(", ")} already exists` : "Resource already exists",
				error: "Conflict",
				code: "DUPLICATE_KEY",
				details: { fields },
			});
		}
		if (exception instanceof MongooseError.CastError) {
			return new BadRequestException({
				message: `Invalid value for ${exception.path}`,
				error: "Bad Request",
				code: "INVALID_VALUE",
				details: { field: exception.path },
			});
		}
		if (exception instanceof MongooseError.ValidationError) {
			const details: Record<string, string[]> = {};
			for (const [path, issue] of Object.entries(exception.errors)) details[path] = [issue.message];
			return new BadRequestException({
				message: "Validation failed",
				error: "Bad Request",
				code: "VALIDATION_FAILED",
				details,
			});
		}
		return exception;
	}
}
