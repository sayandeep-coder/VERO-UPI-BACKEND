import type { LedgerTransactionStatus } from "../../constants/ledgerConstants.js";
import type { LedgerTransaction } from "../entities/LedgerTransaction.js";

export interface CreateLedgerTransactionInput {
  referenceType: string;
  referenceId?: string | null;
  description?: string | null;
  totalAmount: string;
  status: LedgerTransactionStatus;
}

export interface LedgerTransactionRepository {
  create(input: CreateLedgerTransactionInput): Promise<LedgerTransaction>;
  findById(transactionId: string): Promise<LedgerTransaction | null>;
  findByIdWithEntries(transactionId: string): Promise<LedgerTransaction | null>;
  findByReference(referenceType: string, referenceId: string): Promise<LedgerTransaction | null>;
  updateStatus(transactionId: string, status: LedgerTransactionStatus): Promise<LedgerTransaction>;
}
