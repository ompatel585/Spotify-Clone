import { registerAs } from "@nestjs/config";
import { validateEnv } from "./env.validation.js";

export const databaseConfig = registerAs("database", () => {
	const env = validateEnv();
	return {
		uri: env.MONGODB_URI,
		maxPoolSize: env.DB_MAX_POOL_SIZE,
		minPoolSize: Math.min(env.DB_MIN_POOL_SIZE, env.DB_MAX_POOL_SIZE),
		serverSelectionTimeoutMs: env.DB_SERVER_SELECTION_TIMEOUT_MS,
		connectRetries: env.DB_CONNECT_RETRIES,
		connectRetryDelayMs: env.DB_CONNECT_RETRY_DELAY_MS,
		autoIndex: env.DB_AUTO_INDEX ?? env.NODE_ENV !== "production",
	};
});
