import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
	RequestTimeoutException,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { catchError, type Observable, TimeoutError, throwError, timeout } from "rxjs";
import { REQUEST_TIMEOUT_KEY } from "../constants/metadata-keys.constants.js";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
	constructor(
		private readonly defaultTimeoutMs: number,
		private readonly reflector: Reflector,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		if (context.getType() !== "http") return next.handle();

		const ms =
			this.reflector.getAllAndOverride<number | undefined>(REQUEST_TIMEOUT_KEY, [
				context.getHandler(),
				context.getClass(),
			]) ?? this.defaultTimeoutMs;
		if (ms <= 0) return next.handle();

		return next.handle().pipe(
			timeout(ms),
			catchError((error: unknown) =>
				throwError(() =>
					error instanceof TimeoutError
						? new RequestTimeoutException({
								message: "Request timed out",
								error: "Request Timeout",
								code: "REQUEST_TIMEOUT",
							})
						: error,
				),
			),
		);
	}
}
