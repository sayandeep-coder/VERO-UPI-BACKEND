import type { BankAccount } from "../../domain/entities/BankAccount.js";
import type { UpiId } from "../../domain/entities/UpiId.js";

export interface CreateBankAccountResponseDto {
  accountId: string;
  accountNumber: string;
  upiId: string;
}

export interface BankAccountDto {
  id: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: string;
  currentBalance: string;
  availableBalance: string;
  currency: string;
  isPrimary: boolean;
  status: string;
  createdAt: string;
}

export interface BalanceDto {
  currentBalance: string;
  availableBalance: string;
}

export interface UpiIdDto {
  id: string;
  accountId: string;
  upiId: string;
  isPrimary: boolean;
  status: string;
  createdAt: string;
}

export const toBankAccountDto = (account: BankAccount): BankAccountDto => ({
  id: account.id,
  accountNumber: account.accountNumber,
  ifscCode: account.ifscCode,
  bankName: account.bankName,
  accountType: account.accountType,
  currentBalance: account.currentBalance,
  availableBalance: account.availableBalance,
  currency: account.currency,
  isPrimary: account.isPrimary,
  status: account.status,
  createdAt: account.createdAt.toISOString()
});

export const toUpiIdDto = (upi: UpiId): UpiIdDto => ({
  id: upi.id,
  accountId: upi.bankAccountId,
  upiId: upi.upiId,
  isPrimary: upi.isPrimary,
  status: upi.status,
  createdAt: upi.createdAt.toISOString()
});
