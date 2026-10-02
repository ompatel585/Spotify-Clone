type QueryValue = string | number | boolean | null | undefined;

/** Drops empty values so equal queries always serialise (and cache) identically. */
export function toQueryParams(params: object | undefined): Record<string, string | number | boolean> {
	const result: Record<string, string | number | boolean> = {};
	if (!params) return result;
	for (const [key, value] of Object.entries(params) as [string, QueryValue][]) {
		if (value === undefined || value === null || value === "") continue;
		result[key] = value;
	}
	return result;
}
