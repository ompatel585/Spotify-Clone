import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { argon2id, hash, verify } from "argon2";

const ARGON2_OPTIONS = { type: argon2id } as const;

@Injectable()
export class PasswordService {
	/** Hash of a random value nobody knows; verified against when the account does not exist. */
	private dummyHash?: Promise<string>;

	hash(password: string): Promise<string> {
		return hash(password, ARGON2_OPTIONS);
	}

	/**
	 * Always performs one argon2 verification, even without a stored hash (unknown email or
	 * Google-only account), so response time does not reveal whether the account exists.
	 */
	async verify(storedHash: string | undefined, password: string): Promise<boolean> {
		if (storedHash === undefined) {
			this.dummyHash ??= this.hash(randomUUID());
			await verify(await this.dummyHash, password).catch(() => false);
			return false;
		}
		return verify(storedHash, password).catch(() => false);
	}
}
