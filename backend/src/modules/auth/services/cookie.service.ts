import { Inject, Injectable } from "@nestjs/common";
import type { CookieOptions, Request, Response } from "express";
import { type AuthConfig, authConfig } from "../../../config/index.js";
import {
	ACCESS_COOKIE,
	OAUTH_COOKIE_PATH,
	OAUTH_STATE_COOKIE,
	OAUTH_STATE_TTL_SECONDS,
	REFRESH_COOKIE,
} from "../constants/auth.constants.js";

export function readCookie(request: Request, name: string): string | undefined {
	const cookies: unknown = request.cookies;
	if (typeof cookies !== "object" || cookies === null) return undefined;
	const value = (cookies as Record<string, unknown>)[name];
	return typeof value === "string" && value !== "" ? value : undefined;
}

@Injectable()
export class CookieService {
	constructor(@Inject(authConfig.KEY) private readonly config: AuthConfig) {}

	/** Pass `refreshToken` only when it was rotated; otherwise the existing refresh cookie stays. */
	setSession(response: Response, tokens: { accessToken: string; refreshToken?: string }): void {
		response.cookie(ACCESS_COOKIE, tokens.accessToken, this.options(this.config.jwt.accessTtlSeconds));
		if (tokens.refreshToken !== undefined) {
			response.cookie(REFRESH_COOKIE, tokens.refreshToken, this.options(this.config.jwt.refreshTtlSeconds));
		}
	}

	clearSession(response: Response): void {
		response.clearCookie(ACCESS_COOKIE, this.options());
		response.clearCookie(REFRESH_COOKIE, this.options());
	}

	setOAuthState(response: Response, signedState: string): void {
		response.cookie(OAUTH_STATE_COOKIE, signedState, {
			...this.options(OAUTH_STATE_TTL_SECONDS),
			path: OAUTH_COOKIE_PATH,
		});
	}

	clearOAuthState(response: Response): void {
		response.clearCookie(OAUTH_STATE_COOKIE, { ...this.options(), path: OAUTH_COOKIE_PATH });
	}

	private options(maxAgeSeconds?: number): CookieOptions {
		const { secure, sameSite, domain } = this.config.cookies;
		return {
			httpOnly: true,
			secure,
			sameSite,
			path: "/",
			...(domain && { domain }),
			...(maxAgeSeconds !== undefined && { maxAge: maxAgeSeconds * 1000 }),
		};
	}
}
