import type { LedgerAccountType, LedgerEntryType } from "../../constants/ledgerConstants.js";

export interface CreateLedgerAccountCommand {
  userId?: string | null;
  bankAccountId?: string | null;
  accountType: LedgerAccountType;
  accountName: string;
}

export interface CreateLedgerTransactionEntryCommand {
  ledgerAccountId: string;
  entryType: LedgerEntryType;
  amount: string;
  description?: string | null;
}

export interface CreateLedgerTransactionCommand {
  userId: string;
  referenceType: string;
  referenceId?: string | null;
  description?: string | null;
  entries: CreateLedgerTransactionEntryCommand[];
}

export interface CreateLedgerEntryCommand {
  ledgerTransactionId: string;
  ledgerAccountId: string;
  amount: string;
  description?: string | null;
}
