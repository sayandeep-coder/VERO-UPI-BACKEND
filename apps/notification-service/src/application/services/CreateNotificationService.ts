import type { Logger } from "@vero/shared-logger";
import type { NotificationType } from "../../constants/notificationConstants.js";
import type { NotificationPreference } from "../../domain/entities/NotificationPreference.js";
import type { NotificationPreferenceRepository } from "../../domain/repositories/NotificationPreferenceRepository.js";
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import type { CreateNotificationCommand } from "../commands/NotificationCommands.js";
import { toNotificationDto, type NotificationDto } from "../dto/NotificationDtos.js";

export class CreateNotificationService {
  public constructor(
    private readonly notifications: NotificationRepository,
    private readonly preferences: NotificationPreferenceRepository,
    private readonly logger: Logger
  ) {}

  public async create(command: CreateNotificationCommand): Promise<NotificationDto | null> {
    const preference = await this.preferences.getOrCreate(command.userId);

    if (!this.isAllowed(command.notificationType, preference)) {
      return null;
    }

    const notification = await this.notifications.create({
      userId: command.userId,
      notificationType: command.notificationType,
      title: command.title,
      message: command.message,
      metadata: command.metadata ?? null
    });

    this.logger.info({ notificationId: notification.id, userId: command.userId }, "Notification Created");

    return toNotificationDto(notification);
  }

  private isAllowed(type: NotificationType, preference: NotificationPreference): boolean {
    if (!preference.pushEnabled) return false;

    switch (type) {
      case "PAYMENT_RECEIVED":
        return preference.paymentNotifications && preference.moneyReceivedNotifications;
      case "PAYMENT_SENT":
        return preference.paymentNotifications && preference.moneySentNotifications;
      case "PAYMENT_FAILED":
        return preference.paymentNotifications;
      case "SECURITY_ALERT":
        return preference.securityNotifications;
      case "GOAL_ACHIEVED":
        return preference.goalNotifications;
      case "AI_INSIGHT":
        return preference.aiInsightNotifications;
      case "ACCOUNT_CREATED":
      case "UPI_CREATED":
      case "SYSTEM_MESSAGE":
        return true;
    }
  }
}
