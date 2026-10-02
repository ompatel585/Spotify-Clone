import { randomBytes, timingSafeEqual } from "node:crypto";
import { type ExecutionContext, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { type AuthConfig, authConfig } from "../../../config/index.js";
import { OAUTH_STATE_COOKIE } from "../constants/auth.constants.js";
import { CookieService, readCookie } from "../services/cookie.service.js";
import { TokenService } from "../services/token.service.js";
import { GOOGLE_STRATEGY } from "../strategies/google.strategy.js";

const STATE_BYTES = 24;

abstract class GoogleGuardBase extends AuthGuard(GOOGLE_STRATEGY) {
	protected constructor(private readonly google: AuthConfig["google"]) {
		super();
	}

	protected assertEnabled(): void {
		if (!this.google.enabled) throw new NotFoundException();
	}
}

/**
 * Starts the flow. The `state` sent to Google is a random nonce; a signed copy goes into a
 * short-lived httpOnly cookie, so the callback can prove the same browser began the flow (CSRF).
 */
@Injectable()
export class GoogleStartGuard extends GoogleGuardBase {
	constructor(
		@Inject(authConfig.KEY) config: AuthConfig,
		private readonly tokens: TokenService,
		private readonly cookies: CookieService,
	) {
		super(config.google);
	}

	override canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		this.assertEnabled();
		return super.canActivate(context) as Promise<boolean>;
	}

	override getAuthenticateOptions(context: ExecutionContext): { state: string; session: false } {
		const nonce = randomBytes(STATE_BYTES).toString("base64url");
		this.cookies.setOAuthState(
			context.switchToHttp().getResponse<Response>(),
			this.tokens.signOAuthState(nonce),
		);
		return { state: nonce, session: false };
	}
}

/**
 * Verifies state, then lets Passport exchange the code. Never throws on a failed sign-in:
 * `request.user` stays unset and the controller redirects the browser back to the login page.
 */
@Injectable()
export class GoogleCallbackGuard extends GoogleGuardBase {
	constructor(
		@Inject(authConfig.KEY) config: AuthConfig,
		private readonly tokens: TokenService,
	) {
		super(config.google);
	}

	override async canActivate(context: ExecutionContext): Promise<boolean> {
		this.assertEnabled();
		const request = context.switchToHttp().getRequest<Request>();
		try {
			if (!this.stateMatches(request)) throw new Error("OAuth state mismatch");
			await super.canActivate(context);
		} catch {
			request.user = undefined;
		}
		return true;
	}

	private stateMatches(request: Request): boolean {
		const signed = readCookie(request, OAUTH_STATE_COOKIE);
		const returned = request.query.state;
		if (!signed || typeof returned !== "string") return false;
		const expected = Buffer.from(this.tokens.verifyOAuthState(signed).nonce);
		const actual = Buffer.from(returned);
		return expected.length === actual.length && timingSafeEqual(expected, actual);
	}
}
