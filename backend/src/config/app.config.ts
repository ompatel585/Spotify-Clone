import { registerAs } from "@nestjs/config";
import { validateEnv } from "./env.validation.js";

export const appConfig = registerAs("app", () => {
	const env = validateEnv();
	return {
		env: env.NODE_ENV,
		isProduction: env.NODE_ENV === "production",
		isDevelopment: env.NODE_ENV === "development",
		port: env.PORT,
		webOrigin: env.WEB_ORIGIN,
		trustProxy: env.TRUST_PROXY,
		logLevel: env.LOG_LEVEL,
		requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
	};
});
