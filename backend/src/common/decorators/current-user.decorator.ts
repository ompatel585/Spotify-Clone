import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { CurrentUser as CurrentUserType } from "../../contracts/index.js";
import type { AuthenticatedRequest } from "../interfaces/authenticated-request.interface.js";

/** The signed-in user. On `@OptionalAuth()` routes it is `undefined` for anonymous callers. */
export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): CurrentUserType =>
		context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
