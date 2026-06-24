import type { TransactionDirection } from "../../constants/paymentConstants.js";

export interface Transaction {
  id: string;
  paymentId: string;
  userId: string;
  transactionDirection: TransactionDirection;
  counterpartyName: string | null;
  counterpartyUpiId: string | null;
  amount: string;
  transactionCategory: string | null;
  transactionStatus: string;
  transactionDate: Date;
  createdAt: Date;
}
