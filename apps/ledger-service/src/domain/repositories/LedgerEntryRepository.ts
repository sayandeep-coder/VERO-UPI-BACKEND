import type { LedgerEntryType } from "../../constants/ledgerConstants.js";
import type { LedgerEntry } from "../entities/LedgerEntry.js";

export interface CreateLedgerEntryInput {
  ledgerTransactionId: string;
  ledgerAccountId: string;
  entryType: LedgerEntryType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description?: string | null;
}

export interface LedgerAccountBalanceProjection {
  ledgerAccountId: string;
  balance: string;
}

export interface LedgerEntryRepository {
  create(input: CreateLedgerEntryInput): Promise<LedgerEntry>;
  findByTransactionId(transactionId: string): Promise<LedgerEntry[]>;
  getCurrentBalance(ledgerAccountId: string): Promise<string>;
  getBalancesByLedgerAccount(): Promise<LedgerAccountBalanceProjection[]>;
}
