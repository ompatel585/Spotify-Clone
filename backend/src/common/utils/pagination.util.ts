import { type CursorPage, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type Paginated } from "../../contracts/index.js";

export function clampLimit(limit: number | undefined, fallback = DEFAULT_PAGE_SIZE): number {
	if (limit === undefined || !Number.isFinite(limit)) return fallback;
	return Math.min(Math.max(Math.trunc(limit), 1), MAX_PAGE_SIZE);
}

export function clampPage(page: number | undefined): number {
	if (page === undefined || !Number.isFinite(page)) return 1;
	return Math.max(Math.trunc(page), 1);
}

export function skipFor(page: number, limit: number): number {
	return (page - 1) * limit;
}

export function buildPaginated<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
	return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

/**
 * Expects the query to have fetched `limit + 1` rows: the extra row only signals that another
 * page exists and is dropped from the result.
 */
export function buildCursorPage<T>(rows: T[], limit: number, cursorOf: (item: T) => string): CursorPage<T> {
	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const last = items.at(-1);
	return { items, nextCursor: hasMore && last !== undefined ? cursorOf(last) : null };
}
