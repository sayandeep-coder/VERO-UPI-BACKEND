import type { BankAccount } from "../entities/BankAccount.js";

export interface CreateBankAccountInput {
  userId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: string;
  currentBalance: string;
  availableBalance: string;
  currency: string;
  isPrimary: boolean;
  status: string;
}

export interface BankAccountRepository {
  findLatestAccountNumber(): Promise<string | null>;
  create(input: CreateBankAccountInput): Promise<BankAccount>;
  findById(accountId: string): Promise<BankAccount | null>;
  findByUserId(userId: string): Promise<BankAccount[]>;
  findByIdForUser(accountId: string, userId: string): Promise<BankAccount | null>;
  existsForUser(userId: string): Promise<boolean>;
}
