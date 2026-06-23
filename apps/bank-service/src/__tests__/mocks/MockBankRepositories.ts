import type { AccountLimitRepository } from "../../domain/repositories/AccountLimitRepository.js";
import type { BankAccountRepository } from "../../domain/repositories/BankAccountRepository.js";
import type { BankUserRepository } from "../../domain/repositories/BankUserRepository.js";
import type { UpiIdRepository } from "../../domain/repositories/UpiIdRepository.js";

export const createMockBankUserRepository = (): BankUserRepository => ({
  findById: async () => null
});

export const createMockBankAccountRepository = (): BankAccountRepository => ({
  findLatestAccountNumber: async () => null,
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findById: async () => null,
  findByUserId: async () => [],
  findByIdForUser: async () => null,
  existsForUser: async () => false
});

export const createMockUpiIdRepository = (): UpiIdRepository => ({
  create: async () => {
    throw new Error("Mock not implemented");
  },
  exists: async () => false,
  findByUserId: async () => [],
  findByAccountId: async () => []
});

export const createMockAccountLimitRepository = (): AccountLimitRepository => ({
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findByAccountId: async () => null
});
