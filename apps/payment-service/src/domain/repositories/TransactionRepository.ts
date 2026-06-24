import type { TransactionDirection } from "../../constants/paymentConstants.js";
import type { Transaction } from "../entities/Transaction.js";

export interface CreateTransactionInput {
  paymentId: string;
  userId: string;
  transactionDirection: TransactionDirection;
  counterpartyName?: string | null;
  counterpartyUpiId?: string | null;
  amount: string;
  transactionCategory?: string | null;
  transactionStatus: string;
}

export interface UserTransactionQuery {
  userId: string;
  limit: number;
  offset: number;
}

export interface TransactionRepository {
  createMany(inputs: CreateTransactionInput[]): Promise<Transaction[]>;
  findById(transactionId: string): Promise<Transaction | null>;
  findByUser(transactionId: string, userId: string): Promise<Transaction | null>;
  findByUserId(query: UserTransactionQuery): Promise<Transaction[]>;
}
