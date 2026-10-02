import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { REQUEST_ID_HEADER, REQUEST_ID_PATTERN } from "../constants/app.constants.js";

type WithId = IncomingMessage & { id?: unknown };

/**
 * Reuses a well-formed incoming `x-request-id` (so ids can span services) or mints a UUID, and
 * echoes it on the response. Idempotent: a request that already has an id keeps it.
 */
export function assignRequestId(req: IncomingMessage, res: ServerResponse): string {
	const existing = (req as WithId).id;
	if (typeof existing === "string") return existing;

	const incoming = req.headers[REQUEST_ID_HEADER];
	const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
	const id = candidate && REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID();
	(req as WithId).id = id;
	res.setHeader(REQUEST_ID_HEADER, id);
	return id;
}

/** Mounted before body parsing so even malformed-body errors carry a request id. */
export function requestIdMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): void {
	assignRequestId(req, res);
	next();
}
