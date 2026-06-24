import { getRequiredEnv, loadServiceConfig } from "@vero/shared-config";
import { createHttpService, startHttpServer } from "@vero/shared-http";
import { createLogger } from "@vero/shared-logger";
import { createNotificationServiceContainer } from "./config/container.js";

const config = loadServiceConfig();
const logger = createLogger(config.SERVICE_NAME, config.LOG_LEVEL);
const { router, startConsumers } = createNotificationServiceContainer({
  jwtAccessSecret: getRequiredEnv("JWT_ACCESS_SECRET"),
  logger
});
const app = createHttpService({ serviceName: config.SERVICE_NAME, logger, router });

startHttpServer(app, config.PORT, logger);
void startConsumers();
