import type {
  Notification as PrismaNotification,
  NotificationPreference as PrismaNotificationPreference,
  Prisma
} from "@prisma/client";
import type { NotificationType } from "../../constants/notificationConstants.js";
import type { Notification } from "../../domain/entities/Notification.js";
import type { NotificationPreference } from "../../domain/entities/NotificationPreference.js";

const toRecord = (value: Prisma.JsonValue | null): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

export const toNotification = (notification: PrismaNotification): Notification => ({
  id: notification.id,
  userId: notification.userId,
  notificationType: notification.notificationType as NotificationType,
  title: notification.title,
  message: notification.message,
  metadata: toRecord(notification.metadata),
  isRead: notification.isRead,
  readAt: notification.readAt,
  createdAt: notification.createdAt
});

export const toNotificationPreference = (
  preference: PrismaNotificationPreference
): NotificationPreference => ({
  id: preference.id,
  userId: preference.userId,
  pushEnabled: preference.pushEnabled,
  paymentNotifications: preference.paymentNotifications,
  moneyReceivedNotifications: preference.moneyReceivedNotifications,
  moneySentNotifications: preference.moneySentNotifications,
  securityNotifications: preference.securityNotifications,
  promotionalNotifications: preference.promotionalNotifications,
  goalNotifications: preference.goalNotifications,
  aiInsightNotifications: preference.aiInsightNotifications,
  createdAt: preference.createdAt,
  updatedAt: preference.updatedAt
});
