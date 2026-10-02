import type { TokenType } from "../constants/auth.constants.js";

type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];

interface StandardClaims {
	iat?: number;
	exp?: number;
	aud?: string | string[];
	iss?: string;
}

interface BasePayload extends StandardClaims {
	typ: TokenTypeValue;
	/** User id */
	sub: string;
}

export interface AccessTokenPayload extends BasePayload {
	typ: typeof TokenType.Access;
	/** Session family the token was issued for */
	fam: string;
}

export interface RefreshTokenPayload extends BasePayload {
	typ: typeof TokenType.Refresh;
	fam: string;
	/** Unique per rotation, so two refresh tokens of one session never hash equal */
	jti: string;
}

export interface SocketTicketPayload extends BasePayload {
	typ: typeof TokenType.Socket;
}

export interface OAuthStatePayload extends StandardClaims {
	typ: typeof TokenType.OAuthState;
	nonce: string;
}
