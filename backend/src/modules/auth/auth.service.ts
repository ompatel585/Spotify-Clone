import { randomUUID } from "node:crypto";
import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Lean } from "../../common/repositories/base.repository.js";
import { isDuplicateKeyError } from "../../common/utils/mongo-errors.util.js";
import { type AuthConfig, authConfig } from "../../config/index.js";
import { NAME_MAX_LENGTH, type SocketTicketResponse, UserRole } from "../../contracts/index.js";
import { toCurrentUser } from "../users/mappers/user.mapper.js";
import type { User } from "../users/schemas/user.schema.js";
import { UsersService } from "../users/users.service.js";
import { INVALID_CREDENTIALS_MESSAGE, REFRESH_REUSE_GRACE_MS } from "./constants/auth.constants.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { AuthResult, ClientMeta, GoogleProfile } from "./interfaces/auth-result.interface.js";
import { PasswordService } from "./services/password.service.js";
import { TokenService } from "./services/token.service.js";
import { SessionsRepository } from "./sessions/sessions.repository.js";

const unauthorized = (message: string, code: string) => new UnauthorizedException({ message, code });

@Injectable()
export class AuthService {
	constructor(
		private readonly users: UsersService,
		private readonly sessions: SessionsRepository,
		private readonly tokens: TokenService,
		private readonly passwords: PasswordService,
		@Inject(authConfig.KEY) private readonly config: AuthConfig,
	) {}

	async register(dto: RegisterDto, meta: ClientMeta): Promise<AuthResult> {
		if (await this.users.findByEmail(dto.email)) throw this.emailTaken();

		const passwordHash = await this.passwords.hash(dto.password);
		let user: Lean<User>;
		try {
			user = await this.users.create({
				email: dto.email,
				name: dto.name,
				passwordHash,
				role: this.roleFor(dto.email),
			});
		} catch (error) {
			// Lost a race against a concurrent sign-up with the same email (unique index).
			throw isDuplicateKeyError(error) ? this.emailTaken() : error;
		}
		return this.startSession(user, meta);
	}

	async login(dto: LoginDto, meta: ClientMeta): Promise<AuthResult> {
		const user = await this.users.findByEmailWithPassword(dto.email);
		// Verified even when the account is missing or has no password, so timing and message never differ.
		const passwordMatches = await this.passwords.verify(user?.passwordHash, dto.password);
		if (!user || !passwordMatches) throw unauthorized(INVALID_CREDENTIALS_MESSAGE, "INVALID_CREDENTIALS");
		return this.startSession(await this.promoteIfAdminEmail(user), meta);
	}

	/**
	 * Rotates the refresh token. Each token can be exchanged once: the atomic compare-and-swap in
	 * `SessionsRepository.rotate` lets exactly one request win. A request presenting the token that
	 * was replaced moments ago (a second simultaneous refresh from the same browser) gets a fresh
	 * access token only; the winner's response carries the new refresh cookie. A replaced token
	 * presented after the grace window means it was stolen or replayed, so the session is revoked.
	 */
	async refresh(refreshToken: string): Promise<AuthResult> {
		const payload = this.tokens.verifyRefresh(refreshToken);
		const presentedHash = this.tokens.hash(refreshToken);
		const now = new Date();
		const newRefreshToken = this.tokens.signRefresh(payload.sub, payload.fam);

		const rotated = await this.sessions.rotate({
			family: payload.fam,
			userId: payload.sub,
			presentedHash,
			newHash: this.tokens.hash(newRefreshToken),
			now,
			expiresAt: new Date(now.getTime() + this.config.jwt.refreshTtlSeconds * 1000),
		});

		if (rotated) {
			const user = await this.users.findCurrentById(payload.sub);
			if (!user) {
				await this.sessions.revokeFamily(payload.fam);
				throw unauthorized("Session is no longer valid", "SESSION_REVOKED");
			}
			return {
				user,
				accessToken: this.tokens.signAccess(user.id, payload.fam),
				refreshToken: newRefreshToken,
			};
		}

		const session = await this.sessions.findByFamily(payload.fam);
		if (!session || session.revokedAt !== null || session.userId.toString() !== payload.sub) {
			throw unauthorized("Session is no longer valid", "SESSION_REVOKED");
		}

		const lostRace =
			session.prevTokenHash === presentedHash &&
			session.rotatedAt !== undefined &&
			now.getTime() - session.rotatedAt.getTime() <= REFRESH_REUSE_GRACE_MS;
		if (!lostRace) {
			await this.sessions.revokeFamily(payload.fam);
			throw unauthorized("Refresh token reuse detected", "TOKEN_REUSED");
		}

		const user = await this.users.findCurrentById(payload.sub);
		if (!user) throw unauthorized("Session is no longer valid", "SESSION_REVOKED");
		return { user, accessToken: this.tokens.signAccess(user.id, payload.fam) };
	}

	/** Idempotent: an unreadable or already-revoked token is simply ignored. */
	async logout(refreshToken: string | undefined): Promise<void> {
		if (!refreshToken) return;
		try {
			const { fam } = this.tokens.verifyRefresh(refreshToken, { ignoreExpiration: true });
			await this.sessions.revokeFamily(fam);
		} catch (error) {
			if (!(error instanceof UnauthorizedException)) throw error;
		}
	}

	logoutAll(userId: string): Promise<void> {
		return this.sessions.revokeAllForUser(userId);
	}

	socketTicket(userId: string): SocketTicketResponse {
		return this.tokens.signSocketTicket(userId);
	}

	/** Existing Google link, else link by (verified) email, else create the account. */
	async signInWithGoogle(profile: GoogleProfile, meta: ClientMeta): Promise<AuthResult> {
		let user = await this.users.findByGoogleId(profile.googleId);

		if (!user) {
			const sameEmail = await this.users.findByEmail(profile.email);
			if (sameEmail) {
				if (sameEmail.googleId && sameEmail.googleId !== profile.googleId) {
					throw unauthorized("Account is linked to a different Google identity", "GOOGLE_MISMATCH");
				}
				user = await this.users.linkGoogle(sameEmail._id.toString(), profile.googleId, profile.avatarUrl);
			} else {
				user = await this.users.create({
					email: profile.email,
					name: this.googleDisplayName(profile),
					googleId: profile.googleId,
					avatarUrl: profile.avatarUrl,
					role: this.roleFor(profile.email),
				});
			}
		}
		if (!user) throw unauthorized("Account not found", "SESSION_REVOKED");
		return this.startSession(await this.promoteIfAdminEmail(user), meta);
	}

	private async startSession(user: Lean<User>, meta: ClientMeta): Promise<AuthResult> {
		const userId = user._id.toString();
		const family = randomUUID();
		const refreshToken = this.tokens.signRefresh(userId, family);
		await this.sessions.start({
			userId,
			family,
			tokenHash: this.tokens.hash(refreshToken),
			expiresAt: new Date(Date.now() + this.config.jwt.refreshTtlSeconds * 1000),
			userAgent: meta.userAgent,
			ip: meta.ip,
		});
		return { user: toCurrentUser(user), accessToken: this.tokens.signAccess(userId, family), refreshToken };
	}

	private roleFor(email: string): UserRole {
		return this.config.adminEmails.includes(email) ? UserRole.Admin : UserRole.User;
	}

	/** Promote only: removing an email from ADMIN_EMAILS never demotes an existing admin. */
	private async promoteIfAdminEmail(user: Lean<User>): Promise<Lean<User>> {
		if (user.role === UserRole.Admin || this.roleFor(user.email) !== UserRole.Admin) return user;
		return (await this.users.promoteToAdmin(user._id.toString())) ?? user;
	}

	private googleDisplayName(profile: GoogleProfile): string {
		const name = profile.name.trim() || profile.email.split("@")[0] || "Listener";
		return name.slice(0, NAME_MAX_LENGTH);
	}

	private emailTaken(): ConflictException {
		return new ConflictException({
			message: "An account with this email already exists",
			error: "Conflict",
			code: "EMAIL_TAKEN",
			details: { email: ["An account with this email already exists"] },
		});
	}
}
