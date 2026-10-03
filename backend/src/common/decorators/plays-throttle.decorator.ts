import { type ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PLAYS_THROTTLE_KEY } from "../constants/metadata-keys.constants.js";

/** Applies the play-reporting rate-limit tier (looser than strict) on top of the default one. */
export const PlaysThrottle = () => SetMetadata(PLAYS_THROTTLE_KEY, true);

const reflector = new Reflector();

export function isPlaysThrottled(context: ExecutionContext): boolean {
	const targets = [context.getHandler(), context.getClass()];
	return reflector.getAllAndOverride<boolean | undefined>(PLAYS_THROTTLE_KEY, targets) === true;
}
