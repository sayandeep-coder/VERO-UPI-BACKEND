import type { NotificationType } from "../../constants/notificationConstants.js";

export interface CreateNotificationCommand {
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}
