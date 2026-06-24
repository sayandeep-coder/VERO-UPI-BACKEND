import type { PaymentStatus, PaymentType } from "../../constants/paymentConstants.js";

export interface Payment {
  id: string;
  paymentReference: string;
  senderUserId: string;
  receiverUserId: string;
  senderBankAccountId: string;
  receiverBankAccountId: string;
  senderUpiId: string;
  receiverUpiId: string;
  amount: string;
  remarks: string | null;
  paymentType: PaymentType;
  status: PaymentStatus;
  ledgerTransactionId: string | null;
  initiatedAt: Date;
  completedAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
