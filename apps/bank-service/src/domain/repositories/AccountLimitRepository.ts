import type { AccountLimit } from "../entities/AccountLimit.js";

export interface CreateAccountLimitInput {
  userId: string;
  bankAccountId: string;
  dailyLimit: string;
  monthlyLimit: string;
  dailyUsedAmount: string;
  monthlyUsedAmount: string;
  currency: string;
  status: string;
}

export interface AccountLimitRepository {
  create(input: CreateAccountLimitInput): Promise<AccountLimit>;
  findByAccountId(bankAccountId: string): Promise<AccountLimit | null>;
}
