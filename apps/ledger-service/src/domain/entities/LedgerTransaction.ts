import type { LedgerTransactionStatus } from "../../constants/ledgerConstants.js";
import type { LedgerEntry } from "./LedgerEntry.js";

export interface LedgerTransaction {
  id: string;
  referenceType: string;
  referenceId: string | null;
  description: string | null;
  status: LedgerTransactionStatus;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  entries?: LedgerEntry[];
}
