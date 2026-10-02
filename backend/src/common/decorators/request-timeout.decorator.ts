import { SetMetadata } from "@nestjs/common";
import { REQUEST_TIMEOUT_KEY } from "../constants/metadata-keys.constants.js";

/** Overrides the global request timeout for a handler (uploads, exports). `0` disables it. */
export const RequestTimeout = (ms: number) => SetMetadata(REQUEST_TIMEOUT_KEY, ms);
