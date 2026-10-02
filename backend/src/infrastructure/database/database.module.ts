import { Global, Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { type DatabaseConfig, databaseConfig } from "../../config/index.js";
import { TransactionService } from "./transaction.service.js";

const logger = new Logger("Database");

function logConnectionEvents(connection: Connection): Connection {
	// Usually already connected when the factory runs, so the event alone would never be logged.
	if (connection.readyState === 1) logger.log("MongoDB connected");
	connection.on("connected", () => logger.log("MongoDB connected"));
	connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
	connection.on("reconnected", () => logger.log("MongoDB reconnected"));
	connection.on("error", (error: Error) => logger.error(`MongoDB error: ${error.message}`));
	return connection;
}

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			inject: [databaseConfig.KEY],
			useFactory: (config: DatabaseConfig) => ({
				uri: config.uri,
				maxPoolSize: config.maxPoolSize,
				minPoolSize: config.minPoolSize,
				serverSelectionTimeoutMS: config.serverSelectionTimeoutMs,
				socketTimeoutMS: 45_000,
				autoIndex: config.autoIndex,
				autoCreate: config.autoIndex,
				// Startup retries only; the driver handles reconnects after a successful first connect.
				retryAttempts: config.connectRetries,
				retryDelay: config.connectRetryDelayMs,
				connectionFactory: logConnectionEvents,
			}),
		}),
	],
	providers: [TransactionService],
	exports: [TransactionService],
})
export class DatabaseModule {}
