import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SWAGGER_PATH } from "../common/constants/app.constants.js";
import { type AppConfig, appConfig } from "../config/index.js";

/** Name of the security scheme controllers reference with `@ApiCookieAuth(SWAGGER_COOKIE_AUTH)`. */
export const SWAGGER_COOKIE_AUTH = "access-token-cookie";

export function setupSwagger(app: INestApplication): void {
	if (app.get<AppConfig>(appConfig.KEY).isProduction) return;

	const document = SwaggerModule.createDocument(
		app,
		new DocumentBuilder()
			.setTitle("Spotify Clone API")
			.setDescription("REST API. Authentication uses httpOnly cookies set by `/api/auth/login`.")
			.setVersion("1.0.0")
			.addCookieAuth("access_token", { type: "apiKey", in: "cookie" }, SWAGGER_COOKIE_AUTH)
			.build(),
	);
	SwaggerModule.setup(SWAGGER_PATH, app, document, {
		jsonDocumentUrl: `${SWAGGER_PATH}-json`,
		swaggerOptions: { persistAuthorization: true, withCredentials: true },
	});
}
