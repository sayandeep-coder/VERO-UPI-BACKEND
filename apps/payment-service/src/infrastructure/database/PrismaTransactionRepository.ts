import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { Transaction } from "../../domain/entities/Transaction.js";
import type {
  CreateTransactionInput,
  TransactionRepository,
  UserTransactionQuery
} from "../../domain/repositories/TransactionRepository.js";
import { toTransaction } from "./paymentMappers.js";

export class PrismaTransactionRepository implements TransactionRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async createMany(inputs: CreateTransactionInput[]): Promise<Transaction[]> {
    try {
      const created = [];
      for (const input of inputs) {
        created.push(
          await this.db.transaction.create({
            data: input
          })
        );
      }
      return created.map(toTransaction);
    } catch (error) {
      this.logger?.error({ error }, "Repository error: create transactions failed");
      throw error;
    }
  }

  public async findById(transactionId: string): Promise<Transaction | null> {
    try {
      const transaction = await this.db.transaction.findUnique({ where: { id: transactionId } });
      return transaction ? toTransaction(transaction) : null;
    } catch (error) {
      this.logger?.error({ error, transactionId }, "Repository error: find transaction failed");
      throw error;
    }
  }

  public async findByUser(transactionId: string, userId: string): Promise<Transaction | null> {
    try {
      const transaction = await this.db.transaction.findFirst({
        where: { id: transactionId, userId }
      });
      return transaction ? toTransaction(transaction) : null;
    } catch (error) {
      this.logger?.error({ error, transactionId, userId }, "Repository error: find owned transaction failed");
      throw error;
    }
  }

  public async findByUserId(query: UserTransactionQuery): Promise<Transaction[]> {
    try {
      const transactions = await this.db.transaction.findMany({
        where: { userId: query.userId },
        orderBy: { transactionDate: "desc" },
        take: query.limit,
        skip: query.offset
      });
      return transactions.map(toTransaction);
    } catch (error) {
      this.logger?.error({ error, userId: query.userId }, "Repository error: find user transactions failed");
      throw error;
    }
  }
}
