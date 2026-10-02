/** Shape of every error response returned by the API. */
export interface ApiErrorBody {
	statusCode: number;
	message: string;
	error: string;
	code?: string;
	details?: unknown;
	requestId?: string;
	path?: string;
	timestamp: string;
}
