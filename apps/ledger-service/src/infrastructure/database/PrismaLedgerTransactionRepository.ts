import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { LedgerTransactionStatus } from "../../constants/ledgerConstants.js";
import type { LedgerTransaction } from "../../domain/entities/LedgerTransaction.js";
import type {
  CreateLedgerTransactionInput,
  LedgerTransactionRepository
} from "../../domain/repositories/LedgerTransactionRepository.js";
import { toLedgerTransaction } from "./ledgerMappers.js";

export class PrismaLedgerTransactionRepository implements LedgerTransactionRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateLedgerTransactionInput): Promise<LedgerTransaction> {
    try {
      const transaction = await this.db.ledgerTransaction.create({
        data: {
          referenceType: input.referenceType,
          referenceId: input.referenceId ?? null,
          description: input.description ?? null,
          totalAmount: input.totalAmount,
          status: input.status
        }
      });

      return toLedgerTransaction(transaction);
    } catch (error) {
      this.logger?.error({ error, referenceType: input.referenceType }, "Repository error: create ledger transaction failed");
      throw error;
    }
  }

  public async findById(transactionId: string): Promise<LedgerTransaction | null> {
    try {
      const transaction = await this.db.ledgerTransaction.findUnique({
        where: { id: transactionId }
      });

      return transaction ? toLedgerTransaction(transaction) : null;
    } catch (error) {
      this.logger?.error({ error, transactionId }, "Repository error: find ledger transaction failed");
      throw error;
    }
  }

  public async findByIdWithEntries(transactionId: string): Promise<LedgerTransaction | null> {
    try {
      const transaction = await this.db.ledgerTransaction.findUnique({
        where: { id: transactionId },
        include: { entries: { orderBy: { createdAt: "asc" } } }
      });

      return transaction ? toLedgerTransaction(transaction) : null;
    } catch (error) {
      this.logger?.error({ error, transactionId }, "Repository error: find ledger transaction with entries failed");
      throw error;
    }
  }

  public async findByReference(referenceType: string, referenceId: string): Promise<LedgerTransaction | null> {
    try {
      const transaction = await this.db.ledgerTransaction.findFirst({
        where: { referenceType, referenceId }
      });

      return transaction ? toLedgerTransaction(transaction) : null;
    } catch (error) {
      this.logger?.error({ error, referenceType, referenceId }, "Repository error: find ledger transaction by reference failed");
      throw error;
    }
  }

  public async updateStatus(transactionId: string, status: LedgerTransactionStatus): Promise<LedgerTransaction> {
    try {
      const transaction = await this.db.ledgerTransaction.update({
        where: { id: transactionId },
        data: { status }
      });

      return toLedgerTransaction(transaction);
    } catch (error) {
      this.logger?.error({ error, transactionId, status }, "Repository error: update ledger transaction status failed");
      throw error;
    }
  }
}
