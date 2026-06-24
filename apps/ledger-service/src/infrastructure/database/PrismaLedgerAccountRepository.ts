import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { LedgerAccount } from "../../domain/entities/LedgerAccount.js";
import type {
  CreateLedgerAccountInput,
  LedgerAccountRepository
} from "../../domain/repositories/LedgerAccountRepository.js";
import { toLedgerAccount } from "./ledgerMappers.js";

export class PrismaLedgerAccountRepository implements LedgerAccountRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateLedgerAccountInput): Promise<LedgerAccount> {
    try {
      const data: {
        userId?: string | null;
        bankAccountId?: string | null;
        accountType: string;
        accountName: string;
        status: string;
      } = {
        accountType: input.accountType,
        accountName: input.accountName,
        status: input.status
      };

      if (input.userId !== undefined) data.userId = input.userId;
      if (input.bankAccountId !== undefined) data.bankAccountId = input.bankAccountId;

      const account = await this.db.ledgerAccount.create({ data });
      return toLedgerAccount(account);
    } catch (error) {
      this.logger?.error({ error, bankAccountId: input.bankAccountId }, "Repository error: create ledger account failed");
      throw error;
    }
  }

  public async findById(accountId: string): Promise<LedgerAccount | null> {
    try {
      const account = await this.db.ledgerAccount.findFirst({
        where: { id: accountId }
      });

      return account ? toLedgerAccount(account) : null;
    } catch (error) {
      this.logger?.error({ error, accountId }, "Repository error: find ledger account failed");
      throw error;
    }
  }

  public async findByBankAccountId(bankAccountId: string): Promise<LedgerAccount | null> {
    try {
      const account = await this.db.ledgerAccount.findFirst({
        where: { bankAccountId }
      });

      return account ? toLedgerAccount(account) : null;
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find ledger account by bank account failed");
      throw error;
    }
  }

  public async findAllActive(): Promise<LedgerAccount[]> {
    try {
      const accounts = await this.db.ledgerAccount.findMany({
        where: { status: "ACTIVE" }
      });

      return accounts.map(toLedgerAccount);
    } catch (error) {
      this.logger?.error({ error }, "Repository error: find active ledger accounts failed");
      throw error;
    }
  }
}
