import { Controller, Get, Header, Query } from "@nestjs/common";
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SWAGGER_COOKIE_AUTH } from "../../bootstrap/setup-swagger.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { OptionalAuth } from "../../common/decorators/optional-auth.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { PublicCache } from "../../common/decorators/public-cache.decorator.js";
import type { CurrentUser as CurrentUserType, Song } from "../../contracts/index.js";
import { SongResponseDto } from "../songs/dto/song-response.dto.js";
import { DiscoveryService } from "./discovery.service.js";
import { DiscoveryQueryDto } from "./dto/discovery-query.dto.js";

@ApiTags("discovery")
@Controller("discovery")
export class DiscoveryController {
	constructor(private readonly discovery: DiscoveryService) {}

	@Get("featured")
	@Public()
	@PublicCache()
	@ApiOperation({ summary: "Featured songs: a stable rotation that changes once per UTC day" })
	@ApiOkResponse({ type: SongResponseDto, isArray: true })
	featured(): Promise<Song[]> {
		return this.discovery.featured();
	}

	@Get("new-releases")
	@Public()
	@PublicCache()
	@ApiOperation({ summary: "Newest songs first" })
	@ApiOkResponse({ type: SongResponseDto, isArray: true })
	newReleases(@Query() query: DiscoveryQueryDto): Promise<Song[]> {
		return this.discovery.newReleases(query.limit);
	}

	@Get("trending")
	@Public()
	@PublicCache()
	@ApiOperation({ summary: "Most played in the last 7 days, topped up with all-time popular songs" })
	@ApiOkResponse({ type: SongResponseDto, isArray: true })
	trending(@Query() query: DiscoveryQueryDto): Promise<Song[]> {
		return this.discovery.trending(query.limit);
	}

	@Get("made-for-you")
	@OptionalAuth()
	@Header("Cache-Control", "private, no-store")
	@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
	@ApiOperation({
		summary: "Personalized picks (unheard songs by your top artists); popular songs when signed out",
	})
	@ApiOkResponse({ type: SongResponseDto, isArray: true })
	madeForYou(
		@CurrentUser() user: CurrentUserType | undefined,
		@Query() query: DiscoveryQueryDto,
	): Promise<Song[]> {
		return this.discovery.madeForYou(user?.id, query.limit);
	}
}
