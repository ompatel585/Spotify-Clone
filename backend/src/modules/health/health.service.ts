import { Injectable } from "@nestjs/common";
import { HealthCheckService, MongooseHealthIndicator } from "@nestjs/terminus";

export type DbStatus = "up" | "down";

const DB_PING_TIMEOUT_MS = 1500;

@Injectable()
export class HealthService {
	private readonly startedAt = Date.now();

	constructor(
		private readonly health: HealthCheckService,
		private readonly mongoose: MongooseHealthIndicator,
	) {}

	uptimeSeconds(): number {
		return Math.round((Date.now() - this.startedAt) / 1000);
	}

	/** Terminus throws when an indicator fails; probes only need up/down, so that is collapsed here. */
	async databaseStatus(): Promise<DbStatus> {
		try {
			await this.health.check([() => this.mongoose.pingCheck("db", { timeout: DB_PING_TIMEOUT_MS })]);
			return "up";
		} catch {
			return "down";
		}
	}
}
