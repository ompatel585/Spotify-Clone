import { BadRequestException, type ValidationError } from "@nestjs/common";

function collect(errors: ValidationError[], parent: string, into: Record<string, string[]>): void {
	for (const error of errors) {
		const field = parent ? `${parent}.${error.property}` : error.property;
		if (error.constraints) into[field] = Object.values(error.constraints);
		if (error.children?.length) collect(error.children, field, into);
	}
}

/** `ValidationPipe` exceptionFactory: groups messages per (dotted) field name under `details`. */
export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
	const details: Record<string, string[]> = {};
	collect(errors, "", details);
	return new BadRequestException({
		message: "Validation failed",
		error: "Bad Request",
		code: "VALIDATION_FAILED",
		details,
	});
}
