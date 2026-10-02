import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiPaginatedResponse } from "../../common/decorators/api-paginated-response.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { PublicCache } from "../../common/decorators/public-cache.decorator.js";
import { ParseObjectIdPipe } from "../../common/pipes/parse-object-id.pipe.js";
import type { Paginated, Song } from "../../contracts/index.js";
import { SongQueryDto } from "./dto/song-query.dto.js";
import { SongResponseDto } from "./dto/song-response.dto.js";
import { SongsService } from "./songs.service.js";

@ApiTags("songs")
@Public()
@PublicCache()
@Controller("songs")
export class SongsController {
	constructor(private readonly songs: SongsService) {}

	@Get()
	@ApiOperation({ summary: "List songs (search, album filter, sort, pagination)" })
	@ApiPaginatedResponse(SongResponseDto)
	list(@Query() query: SongQueryDto): Promise<Paginated<Song>> {
		return this.songs.list(query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get one song" })
	@ApiOkResponse({ type: SongResponseDto })
	@ApiNotFoundResponse({ description: "Song not found" })
	getById(@Param("id", ParseObjectIdPipe) id: string): Promise<Song> {
		return this.songs.getById(id);
	}
}
