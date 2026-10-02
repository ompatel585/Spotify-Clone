import { applyDecorators, type Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

const itemsOf = (model: Type<unknown>) => ({ type: "array", items: { $ref: getSchemaPath(model) } });

/** Documents a `Paginated<T>` response. */
export const ApiPaginatedResponse = (model: Type<unknown>) =>
	applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			schema: {
				type: "object",
				required: ["items", "page", "limit", "total", "totalPages"],
				properties: {
					items: itemsOf(model),
					page: { type: "integer", example: 1 },
					limit: { type: "integer", example: 20 },
					total: { type: "integer", example: 135 },
					totalPages: { type: "integer", example: 7 },
				},
			},
		}),
	);

/** Documents a `CursorPage<T>` response. */
export const ApiCursorPageResponse = (model: Type<unknown>) =>
	applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			schema: {
				type: "object",
				required: ["items", "nextCursor"],
				properties: {
					items: itemsOf(model),
					nextCursor: { type: "string", nullable: true },
				},
			},
		}),
	);
