import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { ApiErrorBody } from "../../contracts/index.js";
import { REQUEST_ID_HEADER } from "../constants/app.constants.js";

interface ErrorFields {
	message: string;
	error?: string;
	code?: string;
	details?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const titleCase = (name: string): string =>
	name
		.toLowerCase()
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

/** Errors raised by body-parser / http-errors carry a safe-to-show 4xx `status` but are not HttpExceptions. */
function clientErrorStatus(exception: unknown): number | undefined {
	if (!isRecord(exception) || exception.expose !== true) return undefined;
	const status = exception.status ?? exception.statusCode;
	return typeof status === "number" && status >= 400 && status < 500 ? status : undefined;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		if (host.getType() !== "http") {
			this.logger.error(
				exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
			);
			return;
		}

		const http = host.switchToHttp();
		const request = http.getRequest<Request>();
		const response = http.getResponse<Response>();
		const { status, fields } = this.describe(exception);
		const requestId = this.requestIdOf(request, response);

		if (status >= 500) {
			this.logger.error({
				msg: `${request.method} ${request.originalUrl} -> ${status}`,
				requestId,
				err:
					exception instanceof Error
						? { type: exception.name, message: exception.message, stack: exception.stack }
						: exception,
			});
		}

		if (response.headersSent) return;

		const body: ApiErrorBody = {
			statusCode: status,
			message: fields.message,
			error: fields.error ?? titleCase(HttpStatus[status] ?? "Error"),
			code: fields.code ?? HttpStatus[status] ?? "ERROR",
			...(fields.details !== undefined && { details: fields.details }),
			requestId,
			path: request.originalUrl,
			timestamp: new Date().toISOString(),
		};
		response.status(status).json(body);
	}

	private describe(exception: unknown): { status: number; fields: ErrorFields } {
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const payload = exception.getResponse();
			if (typeof payload === "string") return { status, fields: { message: payload } };

			const { message, error, code, details } = payload as Record<string, unknown>;
			return {
				status,
				fields: {
					message: Array.isArray(message)
						? message.join("; ")
						: typeof message === "string"
							? message
							: exception.message,
					error: typeof error === "string" ? error : undefined,
					code: typeof code === "string" ? code : undefined,
					details,
				},
			};
		}

		const clientStatus = clientErrorStatus(exception);
		if (clientStatus !== undefined) {
			const message = exception instanceof Error ? exception.message : "Bad request";
			return { status: clientStatus, fields: { message } };
		}

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			fields: { message: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
		};
	}

	private requestIdOf(request: Request, response: Response): string | undefined {
		const pinoId = (request as Request & { id?: unknown }).id;
		if (typeof pinoId === "string" || typeof pinoId === "number") return String(pinoId);
		const header = response.getHeader(REQUEST_ID_HEADER);
		return typeof header === "string" ? header : undefined;
	}
}
