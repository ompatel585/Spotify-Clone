import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY, OPTIONAL_AUTH_KEY } from "../../../common/constants/metadata-keys.constants.js";
import type { AuthenticatedRequest } from "../../../common/interfaces/authenticated-request.interface.js";
import type { CurrentUser } from "../../../contracts/index.js";
import { UsersService } from "../../users/users.service.js";
import { ACCESS_COOKIE } from "../constants/auth.constants.js";
import { readCookie } from "../services/cookie.service.js";
import { TokenService } from "../services/token.service.js";
import { SessionsRepository } from "../sessions/sessions.repository.js";

const BEARER_PREFIX = "Bearer ";

function extractAccessToken(request: Request): string | undefined {
	const header = request.headers.authorization;
	if (header?.startsWith(BEARER_PREFIX)) return header.slice(BEARER_PREFIX.length).trim() || undefined;
	return readCookie(request, ACCESS_COOKIE);
}

/**
 * Default-deny: every route needs a valid access token unless marked `@Public()`.
 * `@OptionalAuth()` attaches the user when a valid token is present and never rejects.
 * The user and the token's session are re-read on each request, so deletions, role changes, "log out" and
 * "log out of all devices" take effect at once instead of when the 15-minute access token runs out.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly tokens: TokenService,
		private readonly users: UsersService,
		private readonly sessions: SessionsRepository,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (context.getType() !== "http") return true;

		const targets = [context.getHandler(), context.getClass()];
		if (this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, targets)) return true;
		const optional =
			this.reflector.getAllAndOverride<boolean | undefined>(OPTIONAL_AUTH_KEY, targets) === true;

		const request = context.switchToHttp().getRequest<Request>();
		const user = await this.authenticate(request);
		if (user) {
			(request as AuthenticatedRequest).user = user;
			return true;
		}
		if (optional) return true;
		throw new UnauthorizedException({ message: "Authentication required", code: "UNAUTHORIZED" });
	}

	private async authenticate(request: Request): Promise<CurrentUser | null> {
		const token = extractAccessToken(request);
		if (!token) return null;
		try {
			const payload = this.tokens.verifyAccess(token);
			const [user, sessionActive] = await Promise.all([
				this.users.findCurrentById(payload.sub),
				this.sessions.isActive(payload.fam, payload.sub),
			]);
			return sessionActive ? user : null;
		} catch (error) {
			if (error instanceof UnauthorizedException) return null;
			throw error;
		}
	}
}
