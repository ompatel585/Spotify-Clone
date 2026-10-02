export const API_PREFIX = "api";
export const HEALTH_PATH = `/${API_PREFIX}/health`;
export const SWAGGER_PATH = `${API_PREFIX}/docs`;

export const REQUEST_ID_HEADER = "x-request-id";
/** Incoming request ids are echoed only when they look safe to put in logs and headers. */
export const REQUEST_ID_PATTERN = /^[\w.:-]{1,128}$/;

/** Hard stop if graceful shutdown stalls (open keep-alive connections, hung DB close). */
export const SHUTDOWN_FORCE_EXIT_MS = 10_000;

export const MONGO_DUPLICATE_KEY_CODE = 11_000;
