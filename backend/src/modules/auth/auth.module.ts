import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { type AuthConfig, authConfig } from "../../config/index.js";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { GoogleCallbackGuard, GoogleStartGuard } from "./guards/google-oauth.guard.js";
import { CookieService } from "./services/cookie.service.js";
import { PasswordService } from "./services/password.service.js";
import { TokenService } from "./services/token.service.js";
import { Session, SessionSchema } from "./sessions/session.schema.js";
import { SessionsRepository } from "./sessions/sessions.repository.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		// Secrets and lifetimes are passed per token type in TokenService.
		JwtModule.register({}),
		MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokenService,
		CookieService,
		PasswordService,
		SessionsRepository,
		GoogleStartGuard,
		GoogleCallbackGuard,
		{
			// Registering the strategy is what enables Google: without credentials it is never created.
			provide: GoogleStrategy,
			inject: [authConfig.KEY],
			useFactory: (config: AuthConfig) => (config.google.enabled ? new GoogleStrategy(config.google) : null),
		},
	],
	exports: [TokenService, SessionsRepository],
})
export class AuthModule {}
