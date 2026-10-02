import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../../common/constants/metadata-keys.constants.js";
import type { AuthenticatedRequest } from "../../../common/interfaces/authenticated-request.interface.js";
import type { UserRole } from "../../../contracts/index.js";

/** Runs after `JwtAuthGuard` (registration order in `AppModule`). Routes without `@Roles` pass. */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		if (context.getType() !== "http") return true;

		const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!required?.length) return true;

		const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
		if (user && required.includes(user.role)) return true;
		throw new ForbiddenException({ message: "Insufficient permissions", code: "FORBIDDEN" });
	}
}
