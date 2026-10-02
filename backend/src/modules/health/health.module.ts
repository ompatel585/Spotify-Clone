import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

@Module({
	imports: [TerminusModule.forRoot({ logger: false, errorLogStyle: "json" })],
	controllers: [HealthController],
	providers: [HealthService],
})
export class HealthModule {}
