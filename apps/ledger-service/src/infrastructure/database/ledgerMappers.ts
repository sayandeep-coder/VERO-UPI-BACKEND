import type {
  LedgerAccount as PrismaLedgerAccount,
  LedgerEntry as PrismaLedgerEntry,
  LedgerTransaction as PrismaLedgerTransaction
} from "@prisma/client";
import type { LedgerAccountType, LedgerEntryType, LedgerTransactionStatus } from "../../constants/ledgerConstants.js";
import type { LedgerAccount } from "../../domain/entities/LedgerAccount.js";
import type { LedgerEntry } from "../../domain/entities/LedgerEntry.js";
import type { LedgerTransaction } from "../../domain/entities/LedgerTransaction.js";

export const toLedgerAccount = (account: PrismaLedgerAccount): LedgerAccount => ({
  id: account.id,
  userId: account.userId,
  bankAccountId: account.bankAccountId,
  accountType: account.accountType as LedgerAccountType,
  accountName: account.accountName,
  status: account.status,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt
});

export const toLedgerEntry = (entry: PrismaLedgerEntry): LedgerEntry => ({
  id: entry.id,
  ledgerTransactionId: entry.ledgerTransactionId,
  ledgerAccountId: entry.ledgerAccountId,
  entryType: entry.entryType as LedgerEntryType,
  amount: entry.amount.toFixed(2),
  balanceBefore: entry.balanceBefore.toFixed(2),
  balanceAfter: entry.balanceAfter.toFixed(2),
  description: entry.description,
  createdAt: entry.createdAt
});

export const toLedgerTransaction = (
  transaction: PrismaLedgerTransaction & { entries?: PrismaLedgerEntry[] }
): LedgerTransaction => {
  const mapped: LedgerTransaction = {
    id: transaction.id,
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    description: transaction.description,
    status: transaction.status as LedgerTransactionStatus,
    totalAmount: transaction.totalAmount.toFixed(2),
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  };

  if (transaction.entries) {
    mapped.entries = transaction.entries.map(toLedgerEntry);
  }

  return mapped;
};
