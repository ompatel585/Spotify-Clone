import "reflect-metadata";
import type { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { validateEnv } from "../../../config/index.js";
import { applyDnsServers } from "../dns.js";
import { SeedModule } from "./seed.module.js";
import { type SeedCounts, SeedService } from "./seed.service.js";

const describe = ({ created, updated, unchanged }: SeedCounts): string =>
	`${created} created, ${updated} updated, ${unchanged} unchanged`;

async function main(): Promise<void> {
	const env = validateEnv();
	applyDnsServers(env.DNS_SERVERS);

	let app: INestApplicationContext | undefined;
	try {
		app = await NestFactory.createApplicationContext(SeedModule, { logger: ["error", "warn"] });
		const summary = await app.get(SeedService).run();
		console.log(`Albums: ${describe(summary.albums)}`);
		console.log(`Songs:  ${describe(summary.songs)}`);
	} finally {
		await app?.close();
	}
}

main().catch((error: unknown) => {
	console.error("Seed failed:", error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
