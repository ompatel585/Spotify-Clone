/** Offset pagination, used for catalog and admin lists. */
export interface Paginated<T> {
	items: T[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/** Cursor pagination, used for chat history (newest first). */
export interface CursorPage<T> {
	items: T[];
	nextCursor: string | null;
}

export interface PageQuery {
	page?: number;
	limit?: number;
}

export interface CursorQuery {
	cursor?: string;
	limit?: number;
}
