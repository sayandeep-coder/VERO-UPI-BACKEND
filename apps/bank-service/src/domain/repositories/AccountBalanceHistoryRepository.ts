import type { AccountBalanceHistory } from "../entities/AccountBalanceHistory.js";

export interface CreateAccountBalanceHistoryInput {
  userId: string;
  bankAccountId: string;
  previousBalance: string;
  currentBalance: string;
  availableBalance: string;
  changeAmount: string;
  changeType: string;
  referenceId?: string | null;
  referenceType?: string | null;
}

export interface AccountBalanceHistoryRepository {
  create(input: CreateAccountBalanceHistoryInput): Promise<AccountBalanceHistory>;
  findByAccountId(bankAccountId: string): Promise<AccountBalanceHistory[]>;
}
