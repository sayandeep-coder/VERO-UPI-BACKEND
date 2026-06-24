import { NotFoundError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import { toNotificationDto, type NotificationDto } from "../dto/NotificationDtos.js";

export class MarkNotificationReadService {
  public constructor(
    private readonly notifications: NotificationRepository,
    private readonly logger: Logger
  ) {}

  public async markRead(notificationId: string, userId: string): Promise<NotificationDto> {
    const notification = await this.notifications.markRead(notificationId, userId, new Date());

    if (!notification) {
      throw new NotFoundError("Notification was not found");
    }

    this.logger.info({ notificationId, userId }, "Notification Read");

    return toNotificationDto(notification);
  }
}
