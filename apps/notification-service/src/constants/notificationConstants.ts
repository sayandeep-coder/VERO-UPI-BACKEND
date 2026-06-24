export const NOTIFICATION_TYPES = [
  "PAYMENT_RECEIVED",
  "PAYMENT_SENT",
  "PAYMENT_FAILED",
  "ACCOUNT_CREATED",
  "UPI_CREATED",
  "GOAL_ACHIEVED",
  "AI_INSIGHT",
  "SECURITY_ALERT",
  "SYSTEM_MESSAGE"
] as const;

export const NOTIFICATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
  paymentExchange: "vero.payment",
  bankExchange: "vero.bank",
  queuePrefix: "notification"
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
