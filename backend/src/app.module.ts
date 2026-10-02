import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { isStrictThrottled } from "./common/decorators/strict-throttle.decorator.js";
import { ThrottlerProxyGuard } from "./common/guards/throttler-proxy.guard.js";
import { configNamespaces, type ThrottleConfig, throttleConfig } from "./config/index.js";
import { DatabaseModule } from "./infrastructure/database/database.module.js";
import { LoggerModule } from "./infrastructure/logger/logger.module.js";
import { HealthModule } from "./modules/health/health.module.js";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			ignoreEnvFile: true, // the process environment is the single source (see npm scripts)
			load: configNamespaces, // each namespace factory validates the env (ConfigModule's own `validate` writes coerced values back to process.env)
		}),
		LoggerModule,
		DatabaseModule,
		ThrottlerModule.forRootAsync({
			inject: [throttleConfig.KEY],
			useFactory: (config: ThrottleConfig) => ({
				errorMessage: "Too many requests, please try again later",
				throttlers: [
					{ name: "default", ttl: config.default.ttlMs, limit: config.default.limit },
					{
						name: "strict",
						ttl: config.strict.ttlMs,
						limit: config.strict.limit,
						skipIf: (context) => !isStrictThrottled(context),
					},
				],
			}),
		}),
		HealthModule,
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerProxyGuard }],
})
export class AppModule {}
