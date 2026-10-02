/** Escapes user input so it is matched literally inside a RegExp / `$regex`. */
export function escapeRegex(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
