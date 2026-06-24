import type { LedgerEntryType } from "../../constants/ledgerConstants.js";

export interface LedgerEntry {
  id: string;
  ledgerTransactionId: string;
  ledgerAccountId: string;
  entryType: LedgerEntryType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  createdAt: Date;
}
