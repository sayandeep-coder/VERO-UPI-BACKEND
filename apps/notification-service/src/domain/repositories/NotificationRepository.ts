import type { NotificationType } from "../../constants/notificationConstants.js";
import type { Notification } from "../entities/Notification.js";

export interface CreateNotificationInput {
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationListQuery {
  userId: string;
  limit: number;
  offset: number;
  isRead?: boolean;
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<Notification>;
  findById(notificationId: string): Promise<Notification | null>;
  findByUser(query: NotificationListQuery): Promise<Notification[]>;
  countUnread(userId: string): Promise<number>;
  markRead(notificationId: string, userId: string, readAt: Date): Promise<Notification | null>;
  markAllRead(userId: string, readAt: Date): Promise<number>;
}
