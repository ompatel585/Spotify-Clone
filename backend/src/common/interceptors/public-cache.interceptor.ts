import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from "@nestjs/common";
import type { Response } from "express";
import { type Observable, tap } from "rxjs";

export const PUBLIC_CACHE_CONTROL = "public, max-age=30, stale-while-revalidate=60";

/** Sets shared-cache headers on successful responses only, so error bodies are never cached. */
@Injectable()
export class PublicCacheInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		if (context.getType() !== "http") return next.handle();
		const response = context.switchToHttp().getResponse<Response>();
		return next.handle().pipe(tap(() => response.setHeader("Cache-Control", PUBLIC_CACHE_CONTROL)));
	}
}
