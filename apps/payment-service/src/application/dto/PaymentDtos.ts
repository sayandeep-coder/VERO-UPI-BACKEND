import type { Payment } from "../../domain/entities/Payment.js";
import type { Transaction } from "../../domain/entities/Transaction.js";

export interface SendMoneyResponseDto {
  paymentId: string;
  paymentReference: string;
  status: string;
}

export interface PaymentDto {
  id: string;
  paymentReference: string;
  senderUserId: string;
  receiverUserId: string;
  senderUpiId: string;
  receiverUpiId: string;
  amount: string;
  remarks: string | null;
  paymentType: string;
  status: string;
  ledgerTransactionId: string | null;
  initiatedAt: string;
  completedAt: string | null;
  failedAt: string | null;
}

export interface TransactionDto {
  id: string;
  paymentId: string;
  userId: string;
  direction: string;
  counterpartyName: string | null;
  counterpartyUpiId: string | null;
  amount: string;
  category: string | null;
  status: string;
  transactionDate: string;
}

export const toPaymentDto = (payment: Payment): PaymentDto => ({
  id: payment.id,
  paymentReference: payment.paymentReference,
  senderUserId: payment.senderUserId,
  receiverUserId: payment.receiverUserId,
  senderUpiId: payment.senderUpiId,
  receiverUpiId: payment.receiverUpiId,
  amount: payment.amount,
  remarks: payment.remarks,
  paymentType: payment.paymentType,
  status: payment.status,
  ledgerTransactionId: payment.ledgerTransactionId,
  initiatedAt: payment.initiatedAt.toISOString(),
  completedAt: payment.completedAt?.toISOString() ?? null,
  failedAt: payment.failedAt?.toISOString() ?? null
});

export const toTransactionDto = (transaction: Transaction): TransactionDto => ({
  id: transaction.id,
  paymentId: transaction.paymentId,
  userId: transaction.userId,
  direction: transaction.transactionDirection,
  counterpartyName: transaction.counterpartyName,
  counterpartyUpiId: transaction.counterpartyUpiId,
  amount: transaction.amount,
  category: transaction.transactionCategory,
  status: transaction.transactionStatus,
  transactionDate: transaction.transactionDate.toISOString()
});
