import { createHash, randomUUID } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { type AuthConfig, authConfig } from "../../../config/index.js";
import {
	OAUTH_STATE_TTL_SECONDS,
	TOKEN_ISSUER,
	TokenAudience,
	TokenType,
} from "../constants/auth.constants.js";
import type {
	AccessTokenPayload,
	OAuthStatePayload,
	RefreshTokenPayload,
	SocketTicketPayload,
} from "../interfaces/jwt-payload.interface.js";

const ALGORITHM = "HS256";

interface VerifyOptions {
	/** Only for logout, which must still revoke a session whose token has just expired. */
	ignoreExpiration?: boolean;
}

@Injectable()
export class TokenService {
	constructor(
		private readonly jwt: JwtService,
		@Inject(authConfig.KEY) private readonly config: AuthConfig,
	) {}

	signAccess(userId: string, family: string): string {
		const payload: AccessTokenPayload = { typ: TokenType.Access, sub: userId, fam: family };
		return this.sign(
			payload,
			this.config.jwt.accessSecret,
			TokenAudience.Access,
			this.config.jwt.accessTtlSeconds,
		);
	}

	signRefresh(userId: string, family: string): string {
		const payload: RefreshTokenPayload = {
			typ: TokenType.Refresh,
			sub: userId,
			fam: family,
			jti: randomUUID(),
		};
		return this.sign(
			payload,
			this.config.jwt.refreshSecret,
			TokenAudience.Refresh,
			this.config.jwt.refreshTtlSeconds,
		);
	}

	signSocketTicket(userId: string): { ticket: string; expiresIn: number } {
		const expiresIn = this.config.jwt.socketTicketTtlSeconds;
		const payload: SocketTicketPayload = { typ: TokenType.Socket, sub: userId };
		return {
			ticket: this.sign(payload, this.config.jwt.socketSecret, TokenAudience.Socket, expiresIn),
			expiresIn,
		};
	}

	/** Signed with the refresh secret; the distinct audience keeps it from passing as a refresh token. */
	signOAuthState(nonce: string): string {
		const payload: OAuthStatePayload = { typ: TokenType.OAuthState, nonce };
		return this.sign(
			payload,
			this.config.jwt.refreshSecret,
			TokenAudience.OAuthState,
			OAUTH_STATE_TTL_SECONDS,
		);
	}

	verifyAccess(token: string): AccessTokenPayload {
		return this.verify<AccessTokenPayload>(
			token,
			this.config.jwt.accessSecret,
			TokenAudience.Access,
			TokenType.Access,
		);
	}

	verifyRefresh(token: string, options: VerifyOptions = {}): RefreshTokenPayload {
		return this.verify<RefreshTokenPayload>(
			token,
			this.config.jwt.refreshSecret,
			TokenAudience.Refresh,
			TokenType.Refresh,
			options,
		);
	}

	verifySocketTicket(token: string): SocketTicketPayload {
		return this.verify<SocketTicketPayload>(
			token,
			this.config.jwt.socketSecret,
			TokenAudience.Socket,
			TokenType.Socket,
		);
	}

	verifyOAuthState(token: string): OAuthStatePayload {
		return this.verify<OAuthStatePayload>(
			token,
			this.config.jwt.refreshSecret,
			TokenAudience.OAuthState,
			TokenType.OAuthState,
		);
	}

	/** Refresh tokens are stored only as this digest. */
	hash(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}

	private sign(payload: object, secret: string, audience: string, expiresIn: number): string {
		return this.jwt.sign(payload, {
			secret,
			audience,
			issuer: TOKEN_ISSUER,
			expiresIn,
			algorithm: ALGORITHM,
		});
	}

	private verify<T extends { typ: string }>(
		token: string,
		secret: string,
		audience: string,
		type: string,
		options: VerifyOptions = {},
	): T {
		let payload: T;
		try {
			payload = this.jwt.verify<T>(token, {
				secret,
				audience,
				issuer: TOKEN_ISSUER,
				algorithms: [ALGORITHM],
				ignoreExpiration: options.ignoreExpiration ?? false,
			});
		} catch {
			throw new UnauthorizedException({ message: "Invalid or expired token", code: "INVALID_TOKEN" });
		}
		if (payload.typ !== type) {
			throw new UnauthorizedException({ message: "Invalid or expired token", code: "INVALID_TOKEN" });
		}
		return payload;
	}
}
