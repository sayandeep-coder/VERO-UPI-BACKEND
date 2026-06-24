import type { NotificationPreference } from "../entities/NotificationPreference.js";

export interface UpdateNotificationPreferenceInput {
  pushEnabled?: boolean;
  paymentNotifications?: boolean;
  moneyReceivedNotifications?: boolean;
  moneySentNotifications?: boolean;
  securityNotifications?: boolean;
  promotionalNotifications?: boolean;
  goalNotifications?: boolean;
  aiInsightNotifications?: boolean;
}

export interface NotificationPreferenceRepository {
  getOrCreate(userId: string): Promise<NotificationPreference>;
  update(userId: string, input: UpdateNotificationPreferenceInput): Promise<NotificationPreference>;
}
