import { z } from "zod";

const publicSchema = z.object({
	NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

const serverSchema = z.object({
	API_ORIGIN: z.url().default("http://localhost:5000"),
});

/** Public values are inlined at build time, so each must be read by its literal name. */
export const publicEnv = publicSchema.parse({
	NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

/** Server-only values. Never import this from a client component. */
export function getServerEnv() {
	return serverSchema.parse({ API_ORIGIN: process.env.API_ORIGIN || undefined });
}
