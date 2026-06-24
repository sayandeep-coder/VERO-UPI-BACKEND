export interface PaymentNotificationContext {
  paymentId: string;
  senderUserId: string;
  receiverUserId: string;
  senderName: string | null;
  receiverName: string | null;
}

export interface PaymentNotificationReadRepository {
  findContext(paymentId: string): Promise<PaymentNotificationContext | null>;
}
