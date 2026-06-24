export const SOURCE_EVENTS = {
  paymentCompleted: "PAYMENT_COMPLETED",
  paymentFailed: "PAYMENT_FAILED",
  bankAccountCreated: "BANK_ACCOUNT_CREATED",
  upiIdCreated: "UPI_ID_CREATED"
} as const;

export interface PaymentCompletedEvent {
  eventId: string;
  paymentId: string;
  paymentReference: string;
  amount: string | number;
  senderUserId?: string;
  receiverUserId?: string;
  senderName?: string | null;
  receiverName?: string | null;
  timestamp: string;
}

export interface PaymentFailedEvent {
  eventId: string;
  paymentId: string;
  paymentReference: string;
  amount: string | number;
  senderUserId?: string;
  userId?: string;
  timestamp: string;
}

export interface BankAccountCreatedEvent {
  eventId: string;
  userId: string;
  accountId: string;
  accountNumber: string;
  timestamp: string;
}

export interface UpiIdCreatedEvent {
  eventId: string;
  userId: string;
  accountId: string;
  upiId: string;
  timestamp: string;
}
