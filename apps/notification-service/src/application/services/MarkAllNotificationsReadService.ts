import type { Logger } from "@vero/shared-logger";
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";

export class MarkAllNotificationsReadService {
  public constructor(
    private readonly notifications: NotificationRepository,
    private readonly logger: Logger
  ) {}

  public async markAllRead(userId: string): Promise<{ updated: number }> {
    const updated = await this.notifications.markAllRead(userId, new Date());
    this.logger.info({ userId, updated }, "Notification Read");
    return { updated };
  }
}
