export const PAYMENT_EVENTS = {
  paymentInitiated: "PAYMENT_INITIATED",
  paymentCompleted: "PAYMENT_COMPLETED",
  paymentFailed: "PAYMENT_FAILED",
  paymentReversed: "PAYMENT_REVERSED"
} as const;

export interface PaymentEventPublisher {
  publish(routingKey: string, payload: unknown): Promise<void>;
}
