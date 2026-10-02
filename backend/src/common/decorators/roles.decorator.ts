import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "../../contracts/index.js";
import { ROLES_KEY } from "../constants/metadata-keys.constants.js";

/** Restricts a route to users holding one of the given roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
