import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiErrorBody } from "@/types/contracts";

export interface NormalizedError {
	message: string;
	code: string | null;
	fieldErrors: Record<string, string>;
}

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "Cannot reach the server. Check your connection and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isApiErrorBody(value: unknown): value is Partial<ApiErrorBody> {
	return isRecord(value) && (typeof value.message === "string" || Array.isArray(value.message));
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
	return isRecord(error) && "status" in error;
}

/** Accepts `details` as `{ field: message | message[] }` or `[{ field, message }]`. */
function extractFieldErrors(details: unknown): Record<string, string> {
	const result: Record<string, string> = {};
	if (Array.isArray(details)) {
		for (const item of details) {
			if (isRecord(item) && typeof item.field === "string" && typeof item.message === "string") {
				result[item.field] ??= item.message;
			}
		}
	} else if (isRecord(details)) {
		for (const [field, value] of Object.entries(details)) {
			const message = Array.isArray(value) ? value.find((v) => typeof v === "string") : value;
			if (typeof message === "string") result[field] = message;
		}
	}
	return result;
}

function fromBody(body: Partial<ApiErrorBody>): NormalizedError {
	const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
	return {
		message: message || FALLBACK_MESSAGE,
		code: body.code ?? null,
		fieldErrors: extractFieldErrors(body.details),
	};
}

/** Turns an RTK Query error, a serialized error, an API error body or anything thrown into one shape. */
export function normalizeError(error: unknown): NormalizedError {
	if (isFetchBaseQueryError(error)) {
		const { status } = error;
		if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
			return { message: NETWORK_MESSAGE, code: status, fieldErrors: {} };
		}
		if (status === "PARSING_ERROR" || status === "CUSTOM_ERROR") {
			return { message: FALLBACK_MESSAGE, code: status, fieldErrors: {} };
		}
		if (isApiErrorBody(error.data)) return fromBody(error.data);
		return { message: FALLBACK_MESSAGE, code: String(status), fieldErrors: {} };
	}
	if (isApiErrorBody(error)) return fromBody(error);
	return { message: FALLBACK_MESSAGE, code: null, fieldErrors: {} };
}

export function getErrorMessage(error: unknown): string {
	return normalizeError(error).message;
}
