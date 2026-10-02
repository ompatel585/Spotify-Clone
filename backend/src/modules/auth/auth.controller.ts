import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Logger,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { SWAGGER_COOKIE_AUTH } from "../../bootstrap/setup-swagger.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { StrictThrottle } from "../../common/decorators/strict-throttle.decorator.js";
import { type AppConfig, type AuthConfig, appConfig, authConfig } from "../../config/index.js";
import type {
	AuthProvidersResponse,
	AuthResponse,
	CurrentUser as CurrentUserType,
	SocketTicketResponse,
} from "../../contracts/index.js";
import { AuthService } from "./auth.service.js";
import { MAX_USER_AGENT_LENGTH, REFRESH_COOKIE } from "./constants/auth.constants.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { GoogleCallbackGuard, GoogleStartGuard } from "./guards/google-oauth.guard.js";
import type { AuthResult, ClientMeta, GoogleProfile } from "./interfaces/auth-result.interface.js";
import { CookieService, readCookie } from "./services/cookie.service.js";

function clientMeta(request: Request): ClientMeta {
	return { ip: request.ip, userAgent: request.get("user-agent")?.slice(0, MAX_USER_AGENT_LENGTH) };
}

function isGoogleProfile(value: unknown): value is GoogleProfile {
	return typeof value === "object" && value !== null && "googleId" in value && "email" in value;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(
		private readonly auth: AuthService,
		private readonly cookies: CookieService,
		@Inject(authConfig.KEY) private readonly config: AuthConfig,
		@Inject(appConfig.KEY) private readonly app: AppConfig,
	) {}

	@Public()
	@StrictThrottle()
	@Post("register")
	@ApiOperation({ summary: "Create an account and sign in (sets access_token and refresh_token cookies)" })
	@ApiCreatedResponse({ description: "AuthResponse" })
	async register(
		@Body() dto: RegisterDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<AuthResponse> {
		return this.respond(response, await this.auth.register(dto, clientMeta(request)));
	}

	@Public()
	@StrictThrottle()
	@HttpCode(HttpStatus.OK)
	@Post("login")
	@ApiOperation({ summary: "Sign in with email and password" })
	@ApiOkResponse({ description: "AuthResponse" })
	async login(
		@Body() dto: LoginDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<AuthResponse> {
		return this.respond(response, await this.auth.login(dto, clientMeta(request)));
	}

	@Public()
	@StrictThrottle()
	@HttpCode(HttpStatus.OK)
	@Post("refresh")
	@ApiOperation({ summary: "Rotate the refresh token (cookie) and issue a new access token" })
	@ApiOkResponse({ description: "AuthResponse" })
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<AuthResponse> {
		const token = readCookie(request, REFRESH_COOKIE);
		if (!token) throw new UnauthorizedException({ message: "Authentication required", code: "UNAUTHORIZED" });
		try {
			return this.respond(response, await this.auth.refresh(token));
		} catch (error) {
			// A dead session must not leave stale cookies behind (the web proxy keys off them).
			if (error instanceof UnauthorizedException) this.cookies.clearSession(response);
			throw error;
		}
	}

	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post("logout")
	@ApiOperation({ summary: "Revoke this device's session and clear cookies (idempotent)" })
	@ApiNoContentResponse()
	async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
		await this.auth.logout(readCookie(request, REFRESH_COOKIE));
		this.cookies.clearSession(response);
	}

	@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post("logout-all")
	@ApiOperation({ summary: "Revoke every session of the signed-in user" })
	@ApiNoContentResponse()
	async logoutAll(
		@CurrentUser() user: CurrentUserType,
		@Res({ passthrough: true }) response: Response,
	): Promise<void> {
		await this.auth.logoutAll(user.id);
		this.cookies.clearSession(response);
	}

	@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
	@Get("me")
	@ApiOperation({ summary: "The signed-in user" })
	me(@CurrentUser() user: CurrentUserType): CurrentUserType {
		return user;
	}

	@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
	@HttpCode(HttpStatus.OK)
	@Post("socket-ticket")
	@ApiOperation({ summary: "Short-lived ticket that authenticates the websocket handshake" })
	socketTicket(@CurrentUser() user: CurrentUserType): SocketTicketResponse {
		return this.auth.socketTicket(user.id);
	}

	@Public()
	@Get("providers")
	@ApiOperation({ summary: "Which optional sign-in providers are enabled" })
	providers(): AuthProvidersResponse {
		return { google: this.config.google.enabled };
	}

	@Public()
	@UseGuards(GoogleStartGuard)
	@Get("google")
	@ApiOperation({ summary: "Redirect to Google (404 when Google sign-in is not configured)" })
	googleStart(): void {
		// The guard performs the redirect.
	}

	@Public()
	@UseGuards(GoogleCallbackGuard)
	@Get("google/callback")
	@ApiOperation({ summary: "Google redirect target: sets cookies, then redirects to the web app" })
	async googleCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
		this.cookies.clearOAuthState(response);
		const failure = `${this.app.webOrigin}/login?error=google`;
		if (!isGoogleProfile(request.user)) return response.redirect(failure);
		try {
			const result = await this.auth.signInWithGoogle(request.user, clientMeta(request));
			this.cookies.setSession(response, result);
			response.redirect(`${this.app.webOrigin}/`);
		} catch (error) {
			this.logger.warn(`Google sign-in failed: ${error instanceof Error ? error.message : "unknown error"}`);
			response.redirect(failure);
		}
	}

	private respond(response: Response, result: AuthResult): AuthResponse {
		this.cookies.setSession(response, result);
		return { user: result.user };
	}
}
