import type { ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { ThrottlerGuard, type ThrottlerLimitDetail } from "@nestjs/throttler";
import type { Request, Response } from "express";
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

	/**
	 * The throttler only sends `Retry-After-<name>` for named tiers (e.g. `retry-after-strict`). Clients and browsers
	 * look for the standard header, so always send it as well.
	 */
	protected override async throwThrottlingException(
		context: ExecutionContext,
		detail: ThrottlerLimitDetail,
	): Promise<void> {
		const seconds = Math.max(1, Math.ceil(detail.timeToBlockExpire || detail.timeToExpire));
		context.switchToHttp().getResponse<Response>().setHeader("Retry-After", String(seconds));
		return super.throwThrottlingException(context, detail);
	}

	protected override async shouldSkip(context: ExecutionContext): Promise<boolean> {
		if (context.getType() !== "http") return false;
		const request = context.switchToHttp().getRequest<Request>();
		return request.originalUrl.startsWith(HEALTH_PATH);
	}
}
