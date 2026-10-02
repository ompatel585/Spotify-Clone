import type { Request } from "express";
import type { CurrentUser } from "../../contracts/index.js";

/** Request after `JwtAuthGuard` ran; `user` is only guaranteed on non-public, non-optional routes. */
export interface AuthenticatedRequest extends Request {
	user: CurrentUser;
}
