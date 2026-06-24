import { Prisma } from "@prisma/client";
import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { Notification } from "../../domain/entities/Notification.js";
import type {
  CreateNotificationInput,
  NotificationListQuery,
  NotificationRepository
} from "../../domain/repositories/NotificationRepository.js";
import { toNotification } from "./notificationMappers.js";

export class PrismaNotificationRepository implements NotificationRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateNotificationInput): Promise<Notification> {
    try {
      const notification = await this.db.notification.create({
        data: {
          userId: input.userId,
          notificationType: input.notificationType,
          title: input.title,
          message: input.message,
          metadata: input.metadata ? (input.metadata as Prisma.InputJsonObject) : Prisma.JsonNull
        }
      });
      return toNotification(notification);
    } catch (error) {
      this.logger?.error({ error, userId: input.userId }, "Repository error: create notification failed");
      throw error;
    }
  }

  public async findById(notificationId: string): Promise<Notification | null> {
    try {
      const notification = await this.db.notification.findUnique({ where: { id: notificationId } });
      return notification ? toNotification(notification) : null;
    } catch (error) {
      this.logger?.error({ error, notificationId }, "Repository error: find notification failed");
      throw error;
    }
  }

  public async findByUser(query: NotificationListQuery): Promise<Notification[]> {
    try {
      const notifications = await this.db.notification.findMany({
        where: {
          userId: query.userId,
          ...(query.isRead !== undefined ? { isRead: query.isRead } : {})
        },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset
      });
      return notifications.map(toNotification);
    } catch (error) {
      this.logger?.error({ error, userId: query.userId }, "Repository error: find notifications failed");
      throw error;
    }
  }

  public async countUnread(userId: string): Promise<number> {
    try {
      return await this.db.notification.count({ where: { userId, isRead: false } });
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: count unread notifications failed");
      throw error;
    }
  }

  public async markRead(notificationId: string, userId: string, readAt: Date): Promise<Notification | null> {
    try {
      const existing = await this.db.notification.findFirst({ where: { id: notificationId, userId } });
      if (!existing) return null;

      const notification = await this.db.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt }
      });
      return toNotification(notification);
    } catch (error) {
      this.logger?.error({ error, notificationId, userId }, "Repository error: mark notification read failed");
      throw error;
    }
  }

  public async markAllRead(userId: string, readAt: Date): Promise<number> {
    try {
      const result = await this.db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt }
      });
      return result.count;
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: mark all notifications read failed");
      throw error;
    }
  }
}
