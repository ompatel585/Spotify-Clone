import { z } from "zod";
import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/types/contracts";

const email = z
	.string()
	.trim()
	.min(1, "Enter your email address")
	.pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
	email,
	password: z
		.string()
		.min(1, "Enter your password")
		.max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`),
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Enter your name")
			.max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`),
		email,
		password: z
			.string()
			.min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
			.max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
