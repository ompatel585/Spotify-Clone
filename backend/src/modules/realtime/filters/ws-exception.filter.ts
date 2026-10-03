import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import type { AuthenticatedSocket } from "../interfaces/authenticated-socket.interface.js";

const INTERNAL_ERROR = "Something went wrong";

function messageOf(exception: unknown): string | null {
	if (exception instanceof WsException) {
		const error = exception.getError();
		if (typeof error === "string") return error;
		if (
			typeof error === "object" &&
			error !== null &&
			"message" in error &&
			typeof error.message === "string"
		)
			return error.message;
		return null;
	}
	if (exception instanceof HttpException && exception.getStatus() < 500) return exception.message;
	return null;
}

/** Every socket handler error becomes one `error:socket { message }` to the offending socket only. */
@Catch()
export class WsExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(WsExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const socket = host.switchToWs().getClient<AuthenticatedSocket>();
		const message = messageOf(exception);
		if (message === null) {
			this.logger.error(exception instanceof Error ? exception.stack : String(exception));
		}
		socket.emit("error:socket", { message: message ?? INTERNAL_ERROR });
	}
}
