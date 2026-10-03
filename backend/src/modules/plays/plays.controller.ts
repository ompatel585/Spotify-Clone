import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { SWAGGER_COOKIE_AUTH } from "../../bootstrap/setup-swagger.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { PlaysThrottle } from "../../common/decorators/plays-throttle.decorator.js";
import type { CurrentUser as CurrentUserType, RecentlyPlayedItem } from "../../contracts/index.js";
import { RecentPlaysQueryDto } from "./dto/recent-plays-query.dto.js";
import { RecentlyPlayedItemResponseDto } from "./dto/recently-played-item-response.dto.js";
import { RecordPlayDto } from "./dto/record-play.dto.js";
import { PlaysService } from "./plays.service.js";

@ApiTags("plays")
@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
@Controller("plays")
export class PlaysController {
	constructor(private readonly plays: PlaysService) {}

	@Post()
	@PlaysThrottle()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Report a play (repeats of the same song within 20 s are ignored)" })
	@ApiNoContentResponse({ description: "Accepted (counted or deduplicated)" })
	@ApiNotFoundResponse({ description: "Song not found" })
	@ApiTooManyRequestsResponse({ description: "Rate limit exceeded" })
	async record(@CurrentUser() user: CurrentUserType, @Body() dto: RecordPlayDto): Promise<void> {
		await this.plays.record(user.id, dto.songId);
	}

	@Get("recent")
	@ApiOperation({ summary: "The caller's recently played songs, distinct, newest first" })
	@ApiOkResponse({ type: RecentlyPlayedItemResponseDto, isArray: true })
	recent(
		@CurrentUser() user: CurrentUserType,
		@Query() query: RecentPlaysQueryDto,
	): Promise<RecentlyPlayedItem[]> {
		return this.plays.recent(user.id, query.limit);
	}
}
