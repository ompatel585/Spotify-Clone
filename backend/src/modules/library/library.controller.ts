import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, Query } from "@nestjs/common";
import {
	ApiCookieAuth,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { SWAGGER_COOKIE_AUTH } from "../../bootstrap/setup-swagger.js";
import { ApiPaginatedResponse } from "../../common/decorators/api-paginated-response.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import { ParseObjectIdPipe } from "../../common/pipes/parse-object-id.pipe.js";
import type {
	CurrentUser as CurrentUserType,
	LikedSongIdsResponse,
	Paginated,
	Song,
} from "../../contracts/index.js";
import { SongResponseDto } from "../songs/dto/song-response.dto.js";
import { LikedSongIdsResponseDto } from "./dto/liked-song-ids-response.dto.js";
import { LibraryService } from "./library.service.js";

@ApiTags("library")
@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
@Controller("library")
export class LibraryController {
	constructor(private readonly library: LibraryService) {}

	@Get("likes")
	@ApiOperation({ summary: "The caller's liked songs, newest like first" })
	@ApiPaginatedResponse(SongResponseDto)
	likedSongs(
		@CurrentUser() user: CurrentUserType,
		@Query() query: PaginationQueryDto,
	): Promise<Paginated<Song>> {
		return this.library.likedSongs(user.id, query.page, query.limit);
	}

	@Get("likes/ids")
	@ApiOperation({ summary: "Every liked song id (for O(1) heart state)" })
	@ApiOkResponse({ type: LikedSongIdsResponseDto })
	likedSongIds(@CurrentUser() user: CurrentUserType): Promise<LikedSongIdsResponse> {
		return this.library.likedSongIds(user.id);
	}

	@Put("likes/:songId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Like a song (idempotent)" })
	@ApiNoContentResponse({ description: "Liked" })
	@ApiNotFoundResponse({ description: "Song not found" })
	async like(
		@CurrentUser() user: CurrentUserType,
		@Param("songId", ParseObjectIdPipe) songId: string,
	): Promise<void> {
		await this.library.like(user.id, songId);
	}

	@Delete("likes/:songId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Unlike a song (idempotent)" })
	@ApiNoContentResponse({ description: "Not liked any more" })
	async unlike(
		@CurrentUser() user: CurrentUserType,
		@Param("songId", ParseObjectIdPipe) songId: string,
	): Promise<void> {
		await this.library.unlike(user.id, songId);
	}
}
