export const LEDGER_EVENTS = {
  ledgerAccountCreated: "LEDGER_ACCOUNT_CREATED",
  ledgerTransactionCreated: "LEDGER_TRANSACTION_CREATED",
  ledgerEntryCreated: "LEDGER_ENTRY_CREATED",
  ledgerTransactionReversed: "LEDGER_TRANSACTION_REVERSED",
  bankAccountCreated: "BANK_ACCOUNT_CREATED"
} as const;

export interface BankAccountCreatedEvent {
  eventId: string;
  userId: string;
  accountId: string;
  accountNumber: string;
  timestamp: string;
}

export interface LedgerEventPublisher {
  publish(routingKey: string, payload: unknown): Promise<void>;
}
