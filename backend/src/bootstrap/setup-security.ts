import type { NestExpressApplication } from "@nestjs/platform-express";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { REQUEST_ID_HEADER } from "../common/constants/app.constants.js";
import { type AppConfig, appConfig } from "../config/index.js";

export function setupSecurity(app: NestExpressApplication): void {
	const config = app.get<AppConfig>(appConfig.KEY);

	app.set("trust proxy", config.trustProxy);
	app.disable("x-powered-by");
	app.use(helmet());
	app.use(compression());
	app.use(cookieParser());
	app.enableCors({
		origin: config.webOrigin,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		exposedHeaders: [REQUEST_ID_HEADER, "retry-after"],
		maxAge: 600,
	});
}
