export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const OAUTH_STATE_COOKIE = "oauth_state";

export const TOKEN_ISSUER = "spotify-api";

/** Distinct audiences: a token of one kind is rejected by every other verifier. */
export const TokenAudience = {
	Access: "spotify:access",
	Refresh: "spotify:refresh",
	Socket: "spotify:socket",
	OAuthState: "spotify:oauth-state",
} as const;

export const TokenType = {
	Access: "access",
	Refresh: "refresh",
	Socket: "socket",
	OAuthState: "oauth-state",
} as const;

/**
 * A rotated refresh token is still accepted (access token only, no new refresh token) for this long,
 * so two simultaneous refreshes from one browser do not look like token theft.
 */
export const REFRESH_REUSE_GRACE_MS = 10_000;

export const OAUTH_STATE_TTL_SECONDS = 600;
export const OAUTH_COOKIE_PATH = "/api/auth/google";

export const MAX_USER_AGENT_LENGTH = 256;

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";
