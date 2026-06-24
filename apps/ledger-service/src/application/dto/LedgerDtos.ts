import type { LedgerAccount } from "../../domain/entities/LedgerAccount.js";
import type { LedgerEntry } from "../../domain/entities/LedgerEntry.js";
import type { LedgerTransaction } from "../../domain/entities/LedgerTransaction.js";

export interface LedgerAccountDto {
  id: string;
  userId: string | null;
  bankAccountId: string | null;
  accountType: string;
  accountName: string;
  status: string;
  createdAt: string;
}

export interface LedgerEntryDto {
  id: string;
  ledgerTransactionId: string;
  ledgerAccountId: string;
  entryType: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  createdAt: string;
}

export interface LedgerTransactionDto {
  id: string;
  referenceType: string;
  referenceId: string | null;
  description: string | null;
  status: string;
  totalAmount: string;
  createdAt: string;
  entries: LedgerEntryDto[];
}

export interface ReconciliationMismatchDto {
  bankAccountId: string;
  ledgerAccountId: string;
  ledgerBalance: string;
  bankCurrentBalance: string;
  bankAvailableBalance: string;
}

export interface ReconciliationReportDto {
  checkedAccounts: number;
  mismatchCount: number;
  mismatches: ReconciliationMismatchDto[];
  generatedAt: string;
}

export const toLedgerAccountDto = (account: LedgerAccount): LedgerAccountDto => ({
  id: account.id,
  userId: account.userId,
  bankAccountId: account.bankAccountId,
  accountType: account.accountType,
  accountName: account.accountName,
  status: account.status,
  createdAt: account.createdAt.toISOString()
});

export const toLedgerEntryDto = (entry: LedgerEntry): LedgerEntryDto => ({
  id: entry.id,
  ledgerTransactionId: entry.ledgerTransactionId,
  ledgerAccountId: entry.ledgerAccountId,
  entryType: entry.entryType,
  amount: entry.amount,
  balanceBefore: entry.balanceBefore,
  balanceAfter: entry.balanceAfter,
  description: entry.description,
  createdAt: entry.createdAt.toISOString()
});

export const toLedgerTransactionDto = (transaction: LedgerTransaction): LedgerTransactionDto => ({
  id: transaction.id,
  referenceType: transaction.referenceType,
  referenceId: transaction.referenceId,
  description: transaction.description,
  status: transaction.status,
  totalAmount: transaction.totalAmount,
  createdAt: transaction.createdAt.toISOString(),
  entries: transaction.entries?.map(toLedgerEntryDto) ?? []
});
