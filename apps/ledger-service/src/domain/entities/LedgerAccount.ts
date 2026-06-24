import type { LedgerAccountType } from "../../constants/ledgerConstants.js";

export interface LedgerAccount {
  id: string;
  userId: string | null;
  bankAccountId: string | null;
  accountType: LedgerAccountType;
  accountName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
