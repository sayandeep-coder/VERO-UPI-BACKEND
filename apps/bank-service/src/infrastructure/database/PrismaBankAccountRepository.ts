import { Prisma } from "@prisma/client";
import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import { DuplicateAccountNumberError } from "../../domain/errors/BankDomainErrors.js";
import type {
  BankAccountRepository,
  CreateBankAccountInput
} from "../../domain/repositories/BankAccountRepository.js";
import type { BankAccount } from "../../domain/entities/BankAccount.js";
import { toBankAccount } from "./bankMappers.js";

export class PrismaBankAccountRepository implements BankAccountRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findLatestAccountNumber(): Promise<string | null> {
    try {
      const account = await this.db.bankAccount.findFirst({
        orderBy: { accountNumber: "desc" },
        select: { accountNumber: true }
      });

      return account?.accountNumber ?? null;
    } catch (error) {
      this.logger?.error({ error }, "Repository error: find latest bank account number failed");
      throw error;
    }
  }

  public async create(input: CreateBankAccountInput): Promise<BankAccount> {
    try {
      const account = await this.db.bankAccount.create({
        data: input
      });

      return toBankAccount(account);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateAccountNumberError(input.accountNumber);
      }

      this.logger?.error({ error, userId: input.userId }, "Repository error: create bank account failed");
      throw error;
    }
  }

  public async findById(accountId: string): Promise<BankAccount | null> {
    try {
      const account = await this.db.bankAccount.findFirst({
        where: { id: accountId, deletedAt: null }
      });

      return account ? toBankAccount(account) : null;
    } catch (error) {
      this.logger?.error({ error, accountId }, "Repository error: find bank account by id failed");
      throw error;
    }
  }

  public async findByUserId(userId: string): Promise<BankAccount[]> {
    try {
      const accounts = await this.db.bankAccount.findMany({
        where: { userId, deletedAt: null },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
      });

      return accounts.map(toBankAccount);
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: find bank accounts by user failed");
      throw error;
    }
  }

  public async findByIdForUser(accountId: string, userId: string): Promise<BankAccount | null> {
    try {
      const account = await this.db.bankAccount.findFirst({
        where: { id: accountId, userId, deletedAt: null }
      });

      return account ? toBankAccount(account) : null;
    } catch (error) {
      this.logger?.error({ error, accountId, userId }, "Repository error: find owned bank account failed");
      throw error;
    }
  }

  public async existsForUser(userId: string): Promise<boolean> {
    try {
      const count = await this.db.bankAccount.count({
        where: { userId, deletedAt: null }
      });

      return count > 0;
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: bank account existence check failed");
      throw error;
    }
  }
}
