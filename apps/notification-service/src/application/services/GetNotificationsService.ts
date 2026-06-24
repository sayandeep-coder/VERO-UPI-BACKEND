import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import { toNotificationDto, type NotificationDto } from "../dto/NotificationDtos.js";
import type { GetNotificationsQuery } from "../queries/NotificationQueries.js";

export class GetNotificationsService {
  public constructor(private readonly notifications: NotificationRepository) {}

  public async list(query: GetNotificationsQuery): Promise<NotificationDto[]> {
    const limit = Math.min(query.limit, 100);
    const offset = (query.page - 1) * limit;
    const notifications = await this.notifications.findByUser({
      userId: query.userId,
      limit,
      offset,
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {})
    });

    return notifications.map(toNotificationDto);
  }

  public async unreadCount(userId: string): Promise<{ count: number }> {
    return { count: await this.notifications.countUnread(userId) };
  }
}
