import type { Notification } from "../../domain/entities/Notification.js";
import type { NotificationPreference } from "../../domain/entities/NotificationPreference.js";

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferenceDto {
  pushEnabled: boolean;
  paymentNotifications: boolean;
  moneyReceivedNotifications: boolean;
  moneySentNotifications: boolean;
  securityNotifications: boolean;
  promotionalNotifications: boolean;
  goalNotifications: boolean;
  aiInsightNotifications: boolean;
}

export const toNotificationDto = (notification: Notification): NotificationDto => ({
  id: notification.id,
  type: notification.notificationType,
  title: notification.title,
  message: notification.message,
  metadata: notification.metadata,
  isRead: notification.isRead,
  readAt: notification.readAt?.toISOString() ?? null,
  createdAt: notification.createdAt.toISOString()
});

export const toPreferenceDto = (preference: NotificationPreference): NotificationPreferenceDto => ({
  pushEnabled: preference.pushEnabled,
  paymentNotifications: preference.paymentNotifications,
  moneyReceivedNotifications: preference.moneyReceivedNotifications,
  moneySentNotifications: preference.moneySentNotifications,
  securityNotifications: preference.securityNotifications,
  promotionalNotifications: preference.promotionalNotifications,
  goalNotifications: preference.goalNotifications,
  aiInsightNotifications: preference.aiInsightNotifications
});
