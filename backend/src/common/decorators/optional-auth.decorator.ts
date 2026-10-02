import { SetMetadata } from "@nestjs/common";
import { OPTIONAL_AUTH_KEY } from "../constants/metadata-keys.constants.js";

/** Attaches the user when a valid access token is present but never rejects the request. */
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH_KEY, true);
