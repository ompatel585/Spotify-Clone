import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { type Profile, Strategy } from "passport-google-oauth20";
import type { AuthConfig } from "../../../config/index.js";
import type { GoogleProfile } from "../interfaces/auth-result.interface.js";

export const GOOGLE_STRATEGY = "google";

/** Constructed only when Google is configured (see `AuthModule`). */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE_STRATEGY) {
	constructor(google: AuthConfig["google"]) {
		super({
			clientID: google.clientId ?? "",
			clientSecret: google.clientSecret ?? "",
			callbackURL: google.callbackUrl,
			scope: ["email", "profile"],
		});
	}

	/** Resolves to `false` (authentication fails) unless Google vouches for the email. */
	validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleProfile | false {
		const email = profile.emails?.find((candidate) => candidate.verified)?.value;
		if (!email) return false;
		return {
			googleId: profile.id,
			email: email.trim().toLowerCase(),
			name: profile.displayName ?? "",
			avatarUrl: profile.photos?.[0]?.value ?? null,
		};
	}
}
