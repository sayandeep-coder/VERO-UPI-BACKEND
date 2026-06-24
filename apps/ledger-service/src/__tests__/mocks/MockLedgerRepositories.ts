import type { BankAccountReadRepository } from "../../domain/repositories/BankAccountReadRepository.js";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import type { LedgerEntryRepository } from "../../domain/repositories/LedgerEntryRepository.js";
import type { LedgerTransactionRepository } from "../../domain/repositories/LedgerTransactionRepository.js";

export const createMockLedgerAccountRepository = (): LedgerAccountRepository => ({
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findById: async () => null,
  findByBankAccountId: async () => null,
  findAllActive: async () => []
});

export const createMockLedgerTransactionRepository = (): LedgerTransactionRepository => ({
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findById: async () => null,
  findByIdWithEntries: async () => null,
  findByReference: async () => null,
  updateStatus: async () => {
    throw new Error("Mock not implemented");
  }
});

export const createMockLedgerEntryRepository = (): LedgerEntryRepository => ({
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findByTransactionId: async () => [],
  getCurrentBalance: async () => "0.00",
  getBalancesByLedgerAccount: async () => []
});

export const createMockBankAccountReadRepository = (): BankAccountReadRepository => ({
  findBalanceById: async () => null
});
