import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { type DbStatus, HealthService } from "./health.service.js";

interface HealthBody {
	status: "ok" | "error";
	uptime: number;
	db: DbStatus;
}

const healthSchema = {
	type: "object",
	properties: {
		status: { type: "string", enum: ["ok", "error"] },
		uptime: { type: "integer", description: "Seconds since the process started" },
		db: { type: "string", enum: ["up", "down"] },
	},
};

@ApiTags("health")
@Controller("health")
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Get()
	@ApiOperation({ summary: "Status of the API and its database" })
	@ApiOkResponse({ schema: healthSchema })
	@ApiServiceUnavailableResponse({ description: "Database is unreachable", schema: healthSchema })
	check(@Res({ passthrough: true }) res: Response): Promise<HealthBody> {
		return this.report(res);
	}

	@Get("live")
	@ApiOperation({ summary: "Liveness probe: the process is running" })
	live(): { status: "ok"; uptime: number } {
		return { status: "ok", uptime: this.healthService.uptimeSeconds() };
	}

	@Get("ready")
	@ApiOperation({ summary: "Readiness probe: the database is reachable" })
	@ApiOkResponse({ schema: healthSchema })
	@ApiServiceUnavailableResponse({ description: "Database is unreachable", schema: healthSchema })
	ready(@Res({ passthrough: true }) res: Response): Promise<HealthBody> {
		return this.report(res);
	}

	/** Plain body (not the error envelope) so load balancers and humans see db state even on 503. */
	private async report(res: Response): Promise<HealthBody> {
		const db = await this.healthService.databaseStatus();
		const healthy = db === "up";
		res.status(healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
		return { status: healthy ? "ok" : "error", uptime: this.healthService.uptimeSeconds(), db };
	}
}
