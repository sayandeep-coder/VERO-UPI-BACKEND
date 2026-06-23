import type {
  AccountBalanceHistory as PrismaAccountBalanceHistory,
  AccountLimit as PrismaAccountLimit,
  BankAccount as PrismaBankAccount,
  UpiId as PrismaUpiId
} from "@prisma/client";
import type { AccountBalanceHistory } from "../../domain/entities/AccountBalanceHistory.js";
import type { AccountLimit } from "../../domain/entities/AccountLimit.js";
import type { BankAccount } from "../../domain/entities/BankAccount.js";
import type { UpiId } from "../../domain/entities/UpiId.js";

export const toBankAccount = (account: PrismaBankAccount): BankAccount => ({
  id: account.id,
  userId: account.userId,
  accountNumber: account.accountNumber,
  ifscCode: account.ifscCode,
  bankName: account.bankName,
  accountType: account.accountType,
  currentBalance: account.currentBalance.toFixed(2),
  availableBalance: account.availableBalance.toFixed(2),
  currency: account.currency,
  isPrimary: account.isPrimary,
  status: account.status,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  deletedAt: account.deletedAt
});

export const toUpiId = (upi: PrismaUpiId): UpiId => ({
  id: upi.id,
  userId: upi.userId,
  bankAccountId: upi.bankAccountId,
  upiId: upi.upiId,
  isPrimary: upi.isPrimary,
  status: upi.status,
  createdAt: upi.createdAt,
  updatedAt: upi.updatedAt,
  deletedAt: upi.deletedAt
});

export const toAccountLimit = (limit: PrismaAccountLimit): AccountLimit => ({
  id: limit.id,
  userId: limit.userId,
  bankAccountId: limit.bankAccountId,
  dailyLimit: limit.dailyLimit.toFixed(2),
  monthlyLimit: limit.monthlyLimit.toFixed(2),
  dailyUsedAmount: limit.dailyUsedAmount.toFixed(2),
  monthlyUsedAmount: limit.monthlyUsedAmount.toFixed(2),
  currency: limit.currency,
  status: limit.status,
  createdAt: limit.createdAt,
  updatedAt: limit.updatedAt
});

export const toAccountBalanceHistory = (history: PrismaAccountBalanceHistory): AccountBalanceHistory => ({
  id: history.id,
  userId: history.userId,
  bankAccountId: history.bankAccountId,
  previousBalance: history.previousBalance.toFixed(2),
  currentBalance: history.currentBalance.toFixed(2),
  availableBalance: history.availableBalance.toFixed(2),
  changeAmount: history.changeAmount.toFixed(2),
  changeType: history.changeType,
  referenceId: history.referenceId,
  referenceType: history.referenceType,
  createdAt: history.createdAt
});
