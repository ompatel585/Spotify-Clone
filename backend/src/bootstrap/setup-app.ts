import { ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { API_PREFIX } from "../common/constants/app.constants.js";
import { AllExceptionsFilter } from "../common/filters/all-exceptions.filter.js";
import { MongoExceptionFilter } from "../common/filters/mongo-exception.filter.js";
import { TimeoutInterceptor } from "../common/interceptors/timeout.interceptor.js";
import { requestIdMiddleware } from "../common/middleware/request-id.middleware.js";
import { validationExceptionFactory } from "../common/utils/validation-errors.util.js";
import { type AppConfig, appConfig } from "../config/index.js";

export function setupApp(app: NestExpressApplication): void {
	const config = app.get<AppConfig>(appConfig.KEY);

	app.use(requestIdMiddleware);
	app.setGlobalPrefix(API_PREFIX);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			exceptionFactory: validationExceptionFactory,
		}),
	);

	// Nest tries the most recently registered filter first, so the specific one goes last.
	const allExceptions = new AllExceptionsFilter();
	app.useGlobalFilters(allExceptions, new MongoExceptionFilter(allExceptions));
	app.useGlobalInterceptors(new TimeoutInterceptor(config.requestTimeoutMs, app.get(Reflector)));

	app.enableShutdownHooks();
}
