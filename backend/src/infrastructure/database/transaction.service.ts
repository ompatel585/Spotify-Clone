import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { ClientSession, Connection } from "mongoose";

/**
 * Multi-document transactions need a replica set or sharded cluster (Atlas has one; a local
 * standalone mongod does not). Support is detected once at startup so the same service code
 * runs everywhere: with a transaction where possible, without one otherwise.
 */
@Injectable()
export class TransactionService implements OnModuleInit {
	private readonly logger = new Logger(TransactionService.name);
	private supported = false;

	constructor(@InjectConnection() private readonly connection: Connection) {}

	get transactionsSupported(): boolean {
		return this.supported;
	}

	async onModuleInit(): Promise<void> {
		const db = this.connection.db;
		if (!db) return;
		const hello = await db.admin().command({ hello: 1 });
		this.supported = typeof hello.setName === "string" || hello.msg === "isdbgrid";
		this.logger.log(
			this.supported
				? "Transactions enabled (replica set or sharded cluster)"
				: "Transactions unavailable (standalone MongoDB): running without a session",
		);
	}

	/**
	 * Runs `fn` atomically when transactions are supported (retrying transient errors), otherwise
	 * runs it once with no session. Pass the session through to repository calls; it is
	 * `undefined` in fallback mode, so atomicity is not guaranteed there.
	 */
	async withTransaction<T>(fn: (session: ClientSession | undefined) => Promise<T>): Promise<T> {
		if (!this.supported) return fn(undefined);

		const session = await this.connection.startSession();
		try {
			return await session.withTransaction(() => fn(session));
		} finally {
			await session.endSession();
		}
	}
}
