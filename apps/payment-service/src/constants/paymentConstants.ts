export const PAYMENT_TYPES = ["P2P", "P2M", "SELF_TRANSFER"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REVERSED"] as const;
export const TRANSACTION_DIRECTIONS = ["DEBIT", "CREDIT"] as const;

export const PAYMENT_DEFAULTS = {
  paymentTypeP2p: "P2P",
  statusPending: "PENDING",
  statusProcessing: "PROCESSING",
  statusCompleted: "COMPLETED",
  statusFailed: "FAILED",
  transactionCategoryTransfer: "TRANSFER",
  referencePrefix: "VERO2026",
  referenceSeed: 0,
  ledgerReferenceType: "PAYMENT",
  ledgerEntryDescription: "P2P transfer"
} as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type TransactionDirection = (typeof TRANSACTION_DIRECTIONS)[number];
