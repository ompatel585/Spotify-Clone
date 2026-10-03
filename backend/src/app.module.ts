import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { isPlaysThrottled } from "./common/decorators/plays-throttle.decorator.js";
import { isStrictThrottled } from "./common/decorators/strict-throttle.decorator.js";
import { ThrottlerProxyGuard } from "./common/guards/throttler-proxy.guard.js";
import { configNamespaces, type ThrottleConfig, throttleConfig } from "./config/index.js";
import { DatabaseModule } from "./infrastructure/database/database.module.js";
import { LoggerModule } from "./infrastructure/logger/logger.module.js";
import { AlbumsModule } from "./modules/albums/albums.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "./modules/auth/guards/roles.guard.js";
import { HealthModule } from "./modules/health/health.module.js";
import { PlaysModule } from "./modules/plays/plays.module.js";
import { SongsModule } from "./modules/songs/songs.module.js";
import { UsersModule } from "./modules/users/users.module.js";

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
					{
						name: "plays",
						ttl: config.plays.ttlMs,
						limit: config.plays.limit,
						skipIf: (context) => !isPlaysThrottled(context),
					},
				],
			}),
		}),
		UsersModule,
		AuthModule,
		AlbumsModule,
		SongsModule,
		PlaysModule,
		HealthModule,
	],
	// Guards run in registration order: rate limit first, then authentication, then roles.
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerProxyGuard },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
})
export class AppModule {}
