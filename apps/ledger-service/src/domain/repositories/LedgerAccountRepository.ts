import type { LedgerAccountType } from "../../constants/ledgerConstants.js";
import type { LedgerAccount } from "../entities/LedgerAccount.js";

export interface CreateLedgerAccountInput {
  userId?: string | null;
  bankAccountId?: string | null;
  accountType: LedgerAccountType;
  accountName: string;
  status: string;
}

export interface LedgerAccountRepository {
  create(input: CreateLedgerAccountInput): Promise<LedgerAccount>;
  findById(accountId: string): Promise<LedgerAccount | null>;
  findByBankAccountId(bankAccountId: string): Promise<LedgerAccount | null>;
  findAllActive(): Promise<LedgerAccount[]>;
}
