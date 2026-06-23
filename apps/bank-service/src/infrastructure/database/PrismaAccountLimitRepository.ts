import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { AccountLimit } from "../../domain/entities/AccountLimit.js";
import type {
  AccountLimitRepository,
  CreateAccountLimitInput
} from "../../domain/repositories/AccountLimitRepository.js";
import { toAccountLimit } from "./bankMappers.js";

export class PrismaAccountLimitRepository implements AccountLimitRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateAccountLimitInput): Promise<AccountLimit> {
    try {
      const limit = await this.db.accountLimit.create({
        data: input
      });

      return toAccountLimit(limit);
    } catch (error) {
      this.logger?.error({ error, userId: input.userId }, "Repository error: create account limit failed");
      throw error;
    }
  }

  public async findByAccountId(bankAccountId: string): Promise<AccountLimit | null> {
    try {
      const limit = await this.db.accountLimit.findFirst({
        where: { bankAccountId }
      });

      return limit ? toAccountLimit(limit) : null;
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find account limit failed");
      throw error;
    }
  }
}
