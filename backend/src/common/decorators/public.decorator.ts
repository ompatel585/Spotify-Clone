import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../constants/metadata-keys.constants.js";

/** Opts a route out of the global (default-deny) JWT guard. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
