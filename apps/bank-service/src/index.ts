import { loadServiceConfig } from "@vero/shared-config";
import { createHttpService, startHttpServer } from "@vero/shared-http";
import { createLogger } from "@vero/shared-logger";

const config = loadServiceConfig();
const logger = createLogger(config.SERVICE_NAME, config.LOG_LEVEL);
const app = createHttpService({ serviceName: config.SERVICE_NAME, logger });

startHttpServer(app, config.PORT, logger);
