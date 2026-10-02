import { isIP } from "node:net";
import { z } from "zod";

const PLACEHOLDER_SECRET = /change-?me/i;
const MIN_SECRET_LENGTH = 16;
const MIN_PROD_SECRET_LENGTH = 32;

const DURATION_UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86_400 } as const;

/** "15m" | "7d" | "3600s" -> seconds. Kept as a number so JWT libraries never misread units. */
const durationSeconds = z
	.string()
	.regex(/^\d+[smhd]$/, 'Use a number plus a unit: "30s", "15m", "12h" or "7d"')
	.transform((value) => {
		const unit = value.slice(-1) as keyof typeof DURATION_UNIT_SECONDS;
		return Number.parseInt(value.slice(0, -1), 10) * DURATION_UNIT_SECONDS[unit];
	});

const duration = (fallback: string) => z.string().default(fallback).pipe(durationSeconds);

const positiveInt = (fallback: number, max = Number.MAX_SAFE_INTEGER) =>
	z.coerce.number().int().min(1).max(max).default(fallback);

const secret = z.string().min(MIN_SECRET_LENGTH, `Must be at least ${MIN_SECRET_LENGTH} characters`);

/** Express accepts boolean | number | string (e.g. "loopback", "10.0.0.0/8"). */
const trustProxy = z
	.string()
	.default("loopback")
	.transform((value): boolean | number | string => {
		if (value === "true") return true;
		if (value === "false") return false;
		return /^\d+$/.test(value) ? Number.parseInt(value, 10) : value;
	});

const rawEnvSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	PORT: positiveInt(5000, 65_535),
	WEB_ORIGIN: z
		.url()
		.refine((value) => /^https?:/.test(value), "Must be an http(s) URL")
		.transform((value) => new URL(value).origin),
	TRUST_PROXY: trustProxy,
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
	/** Comma-separated resolver IPs, e.g. "8.8.8.8,1.1.1.1". Empty = use the system resolver. */
	DNS_SERVERS: z
		.string()
		.optional()
		.transform((value, ctx) => {
			const servers = (value ?? "")
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean);
			const bad = servers.find((item) => isIP(item) === 0);
			if (bad) ctx.addIssue({ code: "custom", message: `"${bad}" is not an IP address` });
			return servers;
		}),
	REQUEST_TIMEOUT_MS: z.coerce.number().int().min(0).default(30_000),

	MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\/.+/, "Must start with mongodb:// or mongodb+srv://"),
	DB_MAX_POOL_SIZE: positiveInt(20, 500),
	DB_MIN_POOL_SIZE: z.coerce.number().int().min(0).max(100).default(0),
	DB_SERVER_SELECTION_TIMEOUT_MS: positiveInt(5000),
	DB_CONNECT_RETRIES: z.coerce.number().int().min(0).max(20).default(3),
	DB_CONNECT_RETRY_DELAY_MS: positiveInt(2000),
	/** Defaults to on outside production (index builds are expensive on big collections). */
	DB_AUTO_INDEX: z.stringbool().optional(),

	JWT_ACCESS_SECRET: secret,
	JWT_REFRESH_SECRET: secret,
	JWT_SOCKET_SECRET: secret,
	JWT_ACCESS_TTL: duration("15m"),
	JWT_REFRESH_TTL: duration("7d"),
	JWT_SOCKET_TICKET_TTL: duration("60s"),
	COOKIE_DOMAIN: z.string().optional(),
	/** Defaults to true in production. */
	COOKIE_SECURE: z.stringbool().optional(),
	ADMIN_EMAILS: z
		.string()
		.default("")
		.transform((value) =>
			value
				.split(",")
				.map((email) => email.trim().toLowerCase())
				.filter(Boolean),
		),

	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),

	CLOUDINARY_CLOUD_NAME: z.string().optional(),
	CLOUDINARY_API_KEY: z.string().optional(),
	CLOUDINARY_API_SECRET: z.string().optional(),
	CLOUDINARY_FOLDER: z.string().default("spotify"),

	THROTTLE_TTL_MS: positiveInt(60_000),
	THROTTLE_LIMIT: positiveInt(120),
	/** Tier for credential-style endpoints (login, register, refresh). */
	THROTTLE_STRICT_TTL_MS: positiveInt(60_000),
	THROTTLE_STRICT_LIMIT: positiveInt(10),
});

type RawEnv = z.infer<typeof rawEnvSchema>;

/** Entries must be all present or all absent. */
const ALL_OR_NONE: ReadonlyArray<readonly (keyof RawEnv)[]> = [
	["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
	["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
];

const SECRET_KEYS = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "JWT_SOCKET_SECRET"] as const;

const envSchema = rawEnvSchema.superRefine((env, ctx) => {
	for (const group of ALL_OR_NONE) {
		const present = group.filter((key) => env[key] !== undefined);
		if (present.length === 0 || present.length === group.length) continue;
		for (const key of group.filter((candidate) => env[candidate] === undefined)) {
			ctx.addIssue({ code: "custom", path: [key], message: `Required when ${present.join(", ")} is set` });
		}
	}

	if (env.NODE_ENV !== "production") return;

	for (const key of SECRET_KEYS) {
		const value = env[key];
		if (value.length < MIN_PROD_SECRET_LENGTH) {
			ctx.addIssue({
				code: "custom",
				path: [key],
				message: `Must be at least ${MIN_PROD_SECRET_LENGTH} characters in production`,
			});
		}
		if (PLACEHOLDER_SECRET.test(value)) {
			ctx.addIssue({
				code: "custom",
				path: [key],
				message: "Placeholder secret is not allowed in production",
			});
		}
	}
	if (new Set(SECRET_KEYS.map((key) => env[key])).size !== SECRET_KEYS.length) {
		ctx.addIssue({ code: "custom", path: ["JWT_ACCESS_SECRET"], message: "JWT secrets must all differ" });
	}
});

export type Env = z.infer<typeof envSchema>;

/** `KEY=` (empty) is treated the same as the variable being unset. */
function dropEmptyValues(source: NodeJS.ProcessEnv): Record<string, string> {
	const cleaned: Record<string, string> = {};
	for (const [key, value] of Object.entries(source)) {
		if (value !== undefined && value.trim() !== "") cleaned[key] = value.trim();
	}
	return cleaned;
}

/** Parses the environment and throws one readable error listing every problem. */
export function validateEnv(source: NodeJS.ProcessEnv = process.env): Env {
	const cleaned = dropEmptyValues(source);
	const result = envSchema.safeParse(cleaned);
	if (result.success) return result.data;

	const lines = result.error.issues.map((issue) => {
		const key = issue.path.join(".") || "(env)";
		const missing = issue.code === "invalid_type" && cleaned[key] === undefined;
		return `  - ${key}: ${missing ? "is required" : issue.message}`;
	});
	throw new Error(`Invalid environment configuration:\n${lines.join("\n")}`);
}
