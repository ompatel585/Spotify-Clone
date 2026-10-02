import { registerAs } from "@nestjs/config";
import { validateEnv } from "./env.validation.js";

export const authConfig = registerAs("auth", () => {
	const env = validateEnv();
	const googleConfigured = env.GOOGLE_CLIENT_ID !== undefined && env.GOOGLE_CLIENT_SECRET !== undefined;
	return {
		jwt: {
			accessSecret: env.JWT_ACCESS_SECRET,
			refreshSecret: env.JWT_REFRESH_SECRET,
			socketSecret: env.JWT_SOCKET_SECRET,
			accessTtlSeconds: env.JWT_ACCESS_TTL,
			refreshTtlSeconds: env.JWT_REFRESH_TTL,
			socketTicketTtlSeconds: env.JWT_SOCKET_TICKET_TTL,
		},
		cookies: {
			secure: env.COOKIE_SECURE ?? env.NODE_ENV === "production",
			sameSite: "lax" as const,
			domain: env.COOKIE_DOMAIN,
		},
		adminEmails: env.ADMIN_EMAILS,
		google: {
			enabled: googleConfigured,
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			callbackUrl: `${env.WEB_ORIGIN}/api/auth/google/callback`,
		},
	};
});
