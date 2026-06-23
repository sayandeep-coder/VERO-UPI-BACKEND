export const BANK_EVENTS = {
  bankAccountCreated: "BANK_ACCOUNT_CREATED",
  upiIdCreated: "UPI_ID_CREATED"
} as const;

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

export interface BankEventPublisher {
  publishBankAccountCreated(event: BankAccountCreatedEvent): Promise<void>;
  publishUpiIdCreated(event: UpiIdCreatedEvent): Promise<void>;
}
