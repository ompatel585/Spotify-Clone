import { registerAs } from "@nestjs/config";
import { validateEnv } from "./env.validation.js";

export const throttleConfig = registerAs("throttle", () => {
	const env = validateEnv();
	return {
		default: { ttlMs: env.THROTTLE_TTL_MS, limit: env.THROTTLE_LIMIT },
		strict: { ttlMs: env.THROTTLE_STRICT_TTL_MS, limit: env.THROTTLE_STRICT_LIMIT },
	};
});
