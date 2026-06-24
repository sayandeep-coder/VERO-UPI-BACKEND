import type { PaymentRepository } from "../../domain/repositories/PaymentRepository.js";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";

export const createMockPaymentRepository = (): PaymentRepository => ({
  findLatestPaymentReference: async () => null,
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findById: async () => null,
  findByUser: async () => null,
  findHistory: async () => [],
  updateStatus: async () => {
    throw new Error("Mock not implemented");
  },
  complete: async () => {
    throw new Error("Mock not implemented");
  },
  fail: async () => {
    throw new Error("Mock not implemented");
  }
});

export const createMockTransactionRepository = (): TransactionRepository => ({
  createMany: async () => [],
  findById: async () => null,
  findByUser: async () => null,
  findByUserId: async () => []
});
