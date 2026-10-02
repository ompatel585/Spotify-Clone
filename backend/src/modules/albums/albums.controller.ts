import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiPaginatedResponse } from "../../common/decorators/api-paginated-response.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { PublicCache } from "../../common/decorators/public-cache.decorator.js";
import { ParseObjectIdPipe } from "../../common/pipes/parse-object-id.pipe.js";
import type { Album, AlbumWithTracks, Paginated } from "../../contracts/index.js";
import { AlbumsService } from "./albums.service.js";
import { AlbumQueryDto } from "./dto/album-query.dto.js";
import { AlbumResponseDto, AlbumWithTracksResponseDto } from "./dto/album-response.dto.js";

@ApiTags("albums")
@Public()
@PublicCache()
@Controller("albums")
export class AlbumsController {
	constructor(private readonly albums: AlbumsService) {}

	@Get()
	@ApiOperation({ summary: "List albums with song count and total duration" })
	@ApiPaginatedResponse(AlbumResponseDto)
	list(@Query() query: AlbumQueryDto): Promise<Paginated<Album>> {
		return this.albums.list(query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get one album with its tracks" })
	@ApiOkResponse({ type: AlbumWithTracksResponseDto })
	@ApiNotFoundResponse({ description: "Album not found" })
	getById(@Param("id", ParseObjectIdPipe) id: string): Promise<AlbumWithTracks> {
		return this.albums.getWithTracks(id);
	}
}
