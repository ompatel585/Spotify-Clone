import type { PipelineStage } from "mongoose";
import type { Paginated } from "../../contracts/index.js";
import { buildPaginated, skipFor } from "./pagination.util.js";

export interface FacetResult<T> {
	items: T[];
	total: { count: number }[];
}

/**
 * One `$facet` stage returning the requested page and the total match count in a single aggregation.
 * `itemStages` run on the page rows only, so per-row `$lookup`s never touch rows outside the page.
 */
export function facetPage(
	page: number,
	limit: number,
	itemStages: PipelineStage.FacetPipelineStage[] = [],
): PipelineStage {
	return {
		$facet: {
			items: [{ $skip: skipFor(page, limit) }, { $limit: limit }, ...itemStages],
			total: [{ $count: "count" }],
		},
	};
}

export function toPaginated<T>(
	result: FacetResult<T> | undefined,
	page: number,
	limit: number,
): Paginated<T> {
	return buildPaginated(result?.items ?? [], result?.total[0]?.count ?? 0, page, limit);
}
