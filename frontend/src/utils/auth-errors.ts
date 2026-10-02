import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { normalizeError } from "@/utils/errors";

function getStatus(error: unknown): unknown {
	return typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
}

/**
 * Maps an API error onto a form: field errors go to `setError` (first one gets focus),
 * everything else is returned as a message for a form-level alert.
 */
export function applyAuthError<T extends FieldValues>(
	error: unknown,
	fields: readonly Path<T>[],
	setError: UseFormSetError<T>,
): string | null {
	const { message, code, fieldErrors } = normalizeError(error);
	const status = getStatus(error);

	const messages: Partial<Record<string, string>> = {};
	if (status === 409 || code === "EMAIL_TAKEN") {
		messages.email = "An account with this email already exists. Try logging in instead.";
	} else {
		for (const field of fields) {
			const fieldMessage = fieldErrors[field];
			if (fieldMessage) messages[field] = fieldMessage;
		}
	}

	let focused = false;
	for (const field of fields) {
		const fieldMessage = messages[field];
		if (!fieldMessage) continue;
		setError(field, { type: "server", message: fieldMessage }, { shouldFocus: !focused });
		focused = true;
	}
	if (focused) return null;

	if (status === 429) return "Too many attempts, try again in a minute.";
	if (status === 401) return "Incorrect email or password.";
	return message;
}
