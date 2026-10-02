import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.setGlobalPrefix("api");
	app.enableShutdownHooks();

	const port = Number(process.env.PORT ?? 5000);
	await app.listen(port);
	console.log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();
