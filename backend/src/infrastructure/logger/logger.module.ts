import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { HEALTH_PATH } from "../../common/constants/app.constants.js";
import { assignRequestId } from "../../common/middleware/request-id.middleware.js";
import { type AppConfig, appConfig } from "../../config/index.js";

const REDACTED_PATHS = [
	"req.headers.authorization",
	"req.headers.cookie",
	'res.headers["set-cookie"]',
	"req.body.password",
	"req.body.currentPassword",
	"req.body.newPassword",
	"*.password",
	"*.passwordHash",
	"*.token",
	"*.refreshToken",
];

@Module({
	imports: [
		PinoLoggerModule.forRootAsync({
			inject: [appConfig.KEY],
			useFactory: (config: AppConfig) => ({
				pinoHttp: {
					level: config.logLevel,
					genReqId: assignRequestId,
					redact: { paths: REDACTED_PATHS, censor: "[redacted]" },
					customLogLevel: (_req, res, error) => {
						if (error || res.statusCode >= 500) return "error";
						return res.statusCode >= 400 ? "warn" : "info";
					},
					autoLogging: {
						ignore: (req) => (req as { originalUrl?: string }).originalUrl?.startsWith(HEALTH_PATH) ?? false,
					},
					transport: config.isDevelopment
						? {
								target: "pino-pretty",
								options: {
									singleLine: true,
									colorize: true,
									translateTime: "SYS:HH:MM:ss.l",
									ignore: "pid,hostname",
								},
							}
						: undefined,
				},
			}),
		}),
	],
})
export class LoggerModule {}
