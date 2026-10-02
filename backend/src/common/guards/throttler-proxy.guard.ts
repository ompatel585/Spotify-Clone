import type { ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { HEALTH_PATH } from "../constants/app.constants.js";

/**
 * Keys limits by the real client IP. `req.ip` already honours the `trust proxy` setting, so
 * X-Forwarded-For is only believed when the proxy hop is trusted (never client-spoofable otherwise).
 */
@Injectable()
export class ThrottlerProxyGuard extends ThrottlerGuard {
	protected override async getTracker(req: Record<string, unknown>): Promise<string> {
		const ip = (req as unknown as Request).ip;
		return ip ?? "unknown";
	}

	protected override async shouldSkip(context: ExecutionContext): Promise<boolean> {
		if (context.getType() !== "http") return false;
		const request = context.switchToHttp().getRequest<Request>();
		return request.originalUrl.startsWith(HEALTH_PATH);
	}
}
