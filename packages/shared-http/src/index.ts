import { AppError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import cors from "cors";
import { randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type RequestHandler, type Response, type Router } from "express";
import helmet from "helmet";

export interface HttpServiceOptions {
  serviceName: string;
  logger: Logger;
  router?: Router;
}

export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
};

export const createHttpService = ({ serviceName, logger, router }: HttpServiceOptions) => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use((request, response, next) => {
    const requestId = request.header("x-request-id") ?? randomUUID();
    response.setHeader("x-request-id", requestId);
    request.headers["x-request-id"] = requestId;
    next();
  });

  app.get("/health/live", (_request, response) => {
    response.status(200).json({ data: { service: serviceName, status: "live" } });
  });

  app.get("/health/ready", (_request, response) => {
    response.status(200).json({ data: { service: serviceName, status: "ready" } });
  });

  if (router) {
    app.use("/v1", router);
  }

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        request_id: response.getHeader("x-request-id")
      }
    });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const requestId = response.getHeader("x-request-id");

    if (error instanceof AppError) {
      response.status(error.httpStatus).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          request_id: requestId
        }
      });
      return;
    }

    logger.error({ error, requestId }, "Unhandled request error");
    response.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
        request_id: requestId
      }
    });
  });

  return app;
};

export const startHttpServer = (app: express.Express, port: number, logger: Logger) => {
  const server = app.listen(port, () => {
    logger.info({ port }, "HTTP service started");
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, "HTTP service shutting down");
    server.close(() => {
      logger.info("HTTP service stopped");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
};
