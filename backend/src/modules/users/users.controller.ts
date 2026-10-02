import { Body, Controller, Get, NotFoundException, Patch, Query } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SWAGGER_COOKIE_AUTH } from "../../bootstrap/setup-swagger.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import type { CurrentUser as CurrentUserType, Paginated, PublicUser } from "../../contracts/index.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { UserQueryDto } from "./dto/user-query.dto.js";
import { UsersService } from "./users.service.js";

@ApiTags("users")
@ApiCookieAuth(SWAGGER_COOKIE_AUTH)
@Controller("users")
export class UsersController {
	constructor(private readonly users: UsersService) {}

	@Patch("me")
	@ApiOperation({ summary: "Update the signed-in user's name or avatar" })
	async updateMe(
		@CurrentUser() user: CurrentUserType,
		@Body() dto: UpdateProfileDto,
	): Promise<CurrentUserType> {
		const updated = await this.users.updateProfile(user.id, dto);
		if (!updated) throw new NotFoundException("User not found");
		return updated;
	}

	@Get()
	@ApiOperation({ summary: "People list (everyone except the caller), optionally filtered by name" })
	list(@CurrentUser() user: CurrentUserType, @Query() query: UserQueryDto): Promise<Paginated<PublicUser>> {
		return this.users.listPeople(user.id, query);
	}
}
