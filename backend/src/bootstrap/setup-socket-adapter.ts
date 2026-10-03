import type { NestExpressApplication } from "@nestjs/platform-express";
import { AuthenticatedIoAdapter } from "../modules/realtime/adapters/authenticated-io.adapter.js";

/** Socket.io shares the API port; see AuthenticatedIoAdapter for CORS, limits and handshake auth. */
export function setupSocketAdapter(app: NestExpressApplication): void {
	app.useWebSocketAdapter(new AuthenticatedIoAdapter(app));
}
