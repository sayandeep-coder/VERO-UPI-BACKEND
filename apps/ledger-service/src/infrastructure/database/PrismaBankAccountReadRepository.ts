import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type {
  BankAccountBalance,
  BankAccountReadRepository
} from "../../domain/repositories/BankAccountReadRepository.js";

export class PrismaBankAccountReadRepository implements BankAccountReadRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findBalanceById(bankAccountId: string): Promise<BankAccountBalance | null> {
    try {
      const account = await this.db.bankAccount.findFirst({
        where: { id: bankAccountId, deletedAt: null },
        select: {
          id: true,
          currentBalance: true,
          availableBalance: true
        }
      });

      if (!account) {
        return null;
      }

      return {
        id: account.id,
        currentBalance: account.currentBalance.toFixed(2),
        availableBalance: account.availableBalance.toFixed(2)
      };
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find bank account balance failed");
      throw error;
    }
  }
}
