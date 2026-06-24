import type { PaymentStatus, PaymentType } from "../../constants/paymentConstants.js";
import type { Payment } from "../entities/Payment.js";

export interface CreatePaymentInput {
  paymentReference: string;
  senderUserId: string;
  receiverUserId: string;
  senderBankAccountId: string;
  receiverBankAccountId: string;
  senderUpiId: string;
  receiverUpiId: string;
  amount: string;
  remarks?: string | null;
  paymentType: PaymentType;
  status: PaymentStatus;
}

export interface CompletePaymentInput {
  ledgerTransactionId: string;
  completedAt: Date;
}

export interface PaymentHistoryQuery {
  userId: string;
  limit: number;
  offset: number;
}

export interface PaymentRepository {
  findLatestPaymentReference(): Promise<string | null>;
  create(input: CreatePaymentInput): Promise<Payment>;
  findById(paymentId: string): Promise<Payment | null>;
  findByUser(paymentId: string, userId: string): Promise<Payment | null>;
  findHistory(query: PaymentHistoryQuery): Promise<Payment[]>;
  updateStatus(paymentId: string, status: PaymentStatus): Promise<Payment>;
  complete(paymentId: string, input: CompletePaymentInput): Promise<Payment>;
  fail(paymentId: string, failedAt: Date): Promise<Payment>;
}
