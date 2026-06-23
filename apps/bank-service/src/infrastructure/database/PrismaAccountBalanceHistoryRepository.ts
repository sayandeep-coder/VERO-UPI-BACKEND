import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { AccountBalanceHistory } from "../../domain/entities/AccountBalanceHistory.js";
import type {
  AccountBalanceHistoryRepository,
  CreateAccountBalanceHistoryInput
} from "../../domain/repositories/AccountBalanceHistoryRepository.js";
import { toAccountBalanceHistory } from "./bankMappers.js";

export class PrismaAccountBalanceHistoryRepository implements AccountBalanceHistoryRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateAccountBalanceHistoryInput): Promise<AccountBalanceHistory> {
    try {
      const history = await this.db.accountBalanceHistory.create({
        data: {
          ...input,
          referenceId: input.referenceId ?? null,
          referenceType: input.referenceType ?? null
        }
      });

      return toAccountBalanceHistory(history);
    } catch (error) {
      this.logger?.error({ error, userId: input.userId }, "Repository error: create balance history failed");
      throw error;
    }
  }

  public async findByAccountId(bankAccountId: string): Promise<AccountBalanceHistory[]> {
    try {
      const history = await this.db.accountBalanceHistory.findMany({
        where: { bankAccountId },
        orderBy: { createdAt: "desc" }
      });

      return history.map(toAccountBalanceHistory);
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find balance history failed");
      throw error;
    }
  }
}
