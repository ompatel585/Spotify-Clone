import { type ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { STRICT_THROTTLE_KEY } from "../constants/metadata-keys.constants.js";

/** Applies the stricter rate-limit tier (login, register, refresh) on top of the default one. */
export const StrictThrottle = () => SetMetadata(STRICT_THROTTLE_KEY, true);

const reflector = new Reflector();

export function isStrictThrottled(context: ExecutionContext): boolean {
	const targets = [context.getHandler(), context.getClass()];
	return reflector.getAllAndOverride<boolean | undefined>(STRICT_THROTTLE_KEY, targets) === true;
}
