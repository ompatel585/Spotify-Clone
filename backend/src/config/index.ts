import type { ConfigType } from "@nestjs/config";
import { appConfig } from "./app.config.js";
import { authConfig } from "./auth.config.js";
import { cloudinaryConfig } from "./cloudinary.config.js";
import { databaseConfig } from "./database.config.js";
import { throttleConfig } from "./throttle.config.js";

export { type Env, validateEnv } from "./env.validation.js";
export { appConfig, authConfig, cloudinaryConfig, databaseConfig, throttleConfig };

/** Pass to `ConfigModule.forRoot({ load })`. */
export const configNamespaces = [appConfig, databaseConfig, authConfig, cloudinaryConfig, throttleConfig];

/** Inject with `@Inject(appConfig.KEY) config: AppConfig`. */
export type AppConfig = ConfigType<typeof appConfig>;
export type DatabaseConfig = ConfigType<typeof databaseConfig>;
export type AuthConfig = ConfigType<typeof authConfig>;
export type CloudinaryConfig = ConfigType<typeof cloudinaryConfig>;
export type ThrottleConfig = ConfigType<typeof throttleConfig>;
