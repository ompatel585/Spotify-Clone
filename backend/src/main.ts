import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";
import { setupApp } from "./bootstrap/setup-app.js";
import { setupSecurity } from "./bootstrap/setup-security.js";
import { setupSwagger } from "./bootstrap/setup-swagger.js";
import { SHUTDOWN_FORCE_EXIT_MS } from "./common/constants/app.constants.js";
import { type AppConfig, appConfig, validateEnv } from "./config/index.js";

async function bootstrap(): Promise<void> {
	// Fail before Nest starts so a misconfiguration prints one clear message, not a DI stack trace.
	validateEnv();

	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
	const logger = app.get(Logger);
	app.useLogger(logger);

	setupSecurity(app);
	setupApp(app);
	setupSwagger(app);

	process.once("SIGTERM", () => {
		logger.log("SIGTERM received, shutting down");
		// Nest's shutdown hooks close the server and DB; this only covers a stalled shutdown.
		setTimeout(() => process.exit(1), SHUTDOWN_FORCE_EXIT_MS).unref();
	});

	const { port, env } = app.get<AppConfig>(appConfig.KEY);
	await app.listen(port);
	logger.log(`API listening on port ${port} (${env}), prefix /api`);
}

bootstrap().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
