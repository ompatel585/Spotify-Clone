export const UserRole = {
	User: "user",
	Admin: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
