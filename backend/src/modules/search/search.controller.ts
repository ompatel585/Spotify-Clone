import { Controller, Get, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { PublicCache } from "../../common/decorators/public-cache.decorator.js";
import type { SearchResults } from "../../contracts/index.js";
import { SearchQueryDto } from "./dto/search-query.dto.js";
import { SearchResultsResponseDto } from "./dto/search-results-response.dto.js";
import { SearchService } from "./search.service.js";

@ApiTags("search")
@Public()
@PublicCache()
@Controller("search")
export class SearchController {
	constructor(private readonly search: SearchService) {}

	@Get()
	@ApiOperation({
		summary: "Search songs, albums and artists (ranked: exact > prefix > word prefix > contains)",
	})
	@ApiOkResponse({ type: SearchResultsResponseDto })
	@ApiBadRequestResponse({ description: "Missing, empty or too long query" })
	find(@Query() query: SearchQueryDto): Promise<SearchResults> {
		return this.search.search(query.q, query.limit);
	}
}
