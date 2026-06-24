export const LEDGER_ACCOUNT_TYPES = ["USER", "MERCHANT", "SYSTEM", "SETTLEMENT", "FEE"] as const;
export const LEDGER_ENTRY_TYPES = ["DEBIT", "CREDIT"] as const;
export const LEDGER_TRANSACTION_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REVERSED"] as const;

export const LEDGER_DEFAULTS = {
  statusActive: "ACTIVE",
  statusPending: "PENDING",
  statusCompleted: "COMPLETED",
  statusFailed: "FAILED",
  statusReversed: "REVERSED",
  referenceBankAccount: "BANK_ACCOUNT",
  referenceManual: "MANUAL",
  referenceReversal: "REVERSAL",
  zeroAmount: "0.00",
  eventExchange: "vero.ledger",
  inboundExchange: "vero.bank",
  bankAccountCreatedQueue: "ledger.bank-account-created"
} as const;

export type LedgerAccountType = (typeof LEDGER_ACCOUNT_TYPES)[number];
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];
export type LedgerTransactionStatus = (typeof LEDGER_TRANSACTION_STATUSES)[number];
