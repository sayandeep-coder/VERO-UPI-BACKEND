import type { Payment as PrismaPayment, Transaction as PrismaTransaction } from "@prisma/client";
import type { PaymentStatus, PaymentType, TransactionDirection } from "../../constants/paymentConstants.js";
import type { Payment } from "../../domain/entities/Payment.js";
import type { Transaction } from "../../domain/entities/Transaction.js";

export const toPayment = (payment: PrismaPayment): Payment => ({
  id: payment.id,
  paymentReference: payment.paymentReference,
  senderUserId: payment.senderUserId,
  receiverUserId: payment.receiverUserId,
  senderBankAccountId: payment.senderBankAccountId,
  receiverBankAccountId: payment.receiverBankAccountId,
  senderUpiId: payment.senderUpiId,
  receiverUpiId: payment.receiverUpiId,
  amount: payment.amount.toFixed(2),
  remarks: payment.remarks,
  paymentType: payment.paymentType as PaymentType,
  status: payment.status as PaymentStatus,
  ledgerTransactionId: payment.ledgerTransactionId,
  initiatedAt: payment.initiatedAt,
  completedAt: payment.completedAt,
  failedAt: payment.failedAt,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt
});

export const toTransaction = (transaction: PrismaTransaction): Transaction => ({
  id: transaction.id,
  paymentId: transaction.paymentId,
  userId: transaction.userId,
  transactionDirection: transaction.transactionDirection as TransactionDirection,
  counterpartyName: transaction.counterpartyName,
  counterpartyUpiId: transaction.counterpartyUpiId,
  amount: transaction.amount.toFixed(2),
  transactionCategory: transaction.transactionCategory,
  transactionStatus: transaction.transactionStatus,
  transactionDate: transaction.transactionDate,
  createdAt: transaction.createdAt
});
