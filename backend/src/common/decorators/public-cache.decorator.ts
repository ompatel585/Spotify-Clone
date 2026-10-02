import { UseInterceptors } from "@nestjs/common";
import { PublicCacheInterceptor } from "../interceptors/public-cache.interceptor.js";

/** Marks anonymous-readable GET handlers as briefly cacheable (the ETag stays in effect for revalidation). */
export const PublicCache = () => UseInterceptors(PublicCacheInterceptor);
