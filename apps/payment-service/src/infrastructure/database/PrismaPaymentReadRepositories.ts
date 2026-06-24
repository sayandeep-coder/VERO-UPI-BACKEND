import { prisma, UserRepository, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type {
  BankAccountProfile,
  BankAccountReadRepository,
  LedgerAccountProfile,
  LedgerAccountReadRepository,
  UpiIdProfile,
  UpiIdReadRepository,
  UserProfile,
  UserReadRepository
} from "../../domain/repositories/PaymentReadRepositories.js";

export class PrismaPaymentUserReadRepository implements UserReadRepository {
  private readonly users = new UserRepository(prisma);

  public async findById(userId: string): Promise<UserProfile | null> {
    const user = await this.users.findById(userId);
    return user ? { id: user.id, fullName: user.fullName, status: user.status } : null;
  }
}

export class PrismaPaymentBankAccountReadRepository implements BankAccountReadRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findById(bankAccountId: string): Promise<BankAccountProfile | null> {
    try {
      const account = await this.db.bankAccount.findFirst({
        where: { id: bankAccountId, deletedAt: null }
      });
      return account
        ? {
            id: account.id,
            userId: account.userId,
            currentBalance: account.currentBalance.toFixed(2),
            availableBalance: account.availableBalance.toFixed(2),
            status: account.status
          }
        : null;
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find bank account failed");
      throw error;
    }
  }
}

export class PrismaPaymentUpiIdReadRepository implements UpiIdReadRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findByUpiId(upiId: string): Promise<UpiIdProfile | null> {
    try {
      const upi = await this.db.upiId.findFirst({ where: { upiId, deletedAt: null } });
      return upi ? this.toProfile(upi) : null;
    } catch (error) {
      this.logger?.error({ error, upiId }, "Repository error: find UPI ID failed");
      throw error;
    }
  }

  public async findPrimaryByUser(userId: string): Promise<UpiIdProfile | null> {
    try {
      const upi = await this.db.upiId.findFirst({
        where: { userId, isPrimary: true, deletedAt: null },
        orderBy: { createdAt: "asc" }
      });
      return upi ? this.toProfile(upi) : null;
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: find sender UPI ID failed");
      throw error;
    }
  }

  private toProfile(upi: Awaited<ReturnType<DatabaseClient["upiId"]["findFirst"]>> & object): UpiIdProfile {
    return {
      id: upi.id,
      userId: upi.userId,
      bankAccountId: upi.bankAccountId,
      upiId: upi.upiId,
      status: upi.status
    };
  }
}

export class PrismaPaymentLedgerAccountReadRepository implements LedgerAccountReadRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findByBankAccountId(bankAccountId: string): Promise<LedgerAccountProfile | null> {
    try {
      const account = await this.db.ledgerAccount.findFirst({
        where: { bankAccountId }
      });
      return account
        ? {
            id: account.id,
            userId: account.userId,
            bankAccountId: account.bankAccountId,
            status: account.status
          }
        : null;
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find ledger account failed");
      throw error;
    }
  }
}
