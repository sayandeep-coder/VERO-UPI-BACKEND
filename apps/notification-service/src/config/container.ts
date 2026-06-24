import type { Logger } from "@vero/shared-logger";
import { NotificationController } from "../api/controllers/NotificationController.js";
import { authenticateRequest } from "../api/middlewares/authenticateRequest.js";
import { createNotificationRoutes } from "../api/routes/notificationRoutes.js";
import { CreateNotificationService } from "../application/services/CreateNotificationService.js";
import { GetNotificationPreferencesService } from "../application/services/GetNotificationPreferencesService.js";
import { GetNotificationsService } from "../application/services/GetNotificationsService.js";
import { MarkAllNotificationsReadService } from "../application/services/MarkAllNotificationsReadService.js";
import { MarkNotificationReadService } from "../application/services/MarkNotificationReadService.js";
import { NotificationConsumerService } from "../application/services/NotificationConsumerService.js";
import { UpdateNotificationPreferencesService } from "../application/services/UpdateNotificationPreferencesService.js";
import { PrismaNotificationPreferenceRepository } from "../infrastructure/database/PrismaNotificationPreferenceRepository.js";
import { PrismaNotificationRepository } from "../infrastructure/database/PrismaNotificationRepository.js";
import { PrismaPaymentNotificationReadRepository } from "../infrastructure/database/PrismaPaymentNotificationReadRepository.js";
import {
  createDefaultNotificationConsumerOptions,
  RabbitMqNotificationConsumer
} from "../infrastructure/queue/RabbitMqNotificationConsumer.js";

export interface NotificationServiceContainerOptions {
  jwtAccessSecret: string;
  logger: Logger;
}

export const createNotificationServiceContainer = ({ jwtAccessSecret, logger }: NotificationServiceContainerOptions) => {
  const notificationRepository = new PrismaNotificationRepository(undefined, logger);
  const preferenceRepository = new PrismaNotificationPreferenceRepository(undefined, logger);
  const paymentReadRepository = new PrismaPaymentNotificationReadRepository(undefined, logger);
  const createNotificationService = new CreateNotificationService(notificationRepository, preferenceRepository, logger);
  const getNotificationsService = new GetNotificationsService(notificationRepository);
  const markNotificationReadService = new MarkNotificationReadService(notificationRepository, logger);
  const markAllNotificationsReadService = new MarkAllNotificationsReadService(notificationRepository, logger);
  const getPreferencesService = new GetNotificationPreferencesService(preferenceRepository);
  const updatePreferencesService = new UpdateNotificationPreferencesService(preferenceRepository, logger);
  const consumerService = new NotificationConsumerService(createNotificationService, paymentReadRepository, logger);
  const consumerOptions = createDefaultNotificationConsumerOptions();
  const rabbitConsumerOptions: ConstructorParameters<typeof RabbitMqNotificationConsumer>[0] = {
    ...consumerOptions
  };

  if (process.env.RABBITMQ_URL) {
    rabbitConsumerOptions.rabbitMqUrl = process.env.RABBITMQ_URL;
  }

  const consumer = new RabbitMqNotificationConsumer(rabbitConsumerOptions, consumerService, logger);
  const controller = new NotificationController(
    getNotificationsService,
    markNotificationReadService,
    markAllNotificationsReadService,
    getPreferencesService,
    updatePreferencesService
  );
  const router = createNotificationRoutes(controller, authenticateRequest(jwtAccessSecret));

  return {
    router,
    startConsumers: async () => {
      await consumer.start();
    }
  };
};
