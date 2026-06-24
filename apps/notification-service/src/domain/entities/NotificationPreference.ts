export interface NotificationPreference {
  id: string;
  userId: string;
  pushEnabled: boolean;
  paymentNotifications: boolean;
  moneyReceivedNotifications: boolean;
  moneySentNotifications: boolean;
  securityNotifications: boolean;
  promotionalNotifications: boolean;
  goalNotifications: boolean;
  aiInsightNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}
