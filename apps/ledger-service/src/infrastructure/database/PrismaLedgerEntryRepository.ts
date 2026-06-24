import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import { Money } from "../../domain/value-objects/Money.js";
import type { LedgerEntry } from "../../domain/entities/LedgerEntry.js";
import type {
  CreateLedgerEntryInput,
  LedgerAccountBalanceProjection,
  LedgerEntryRepository
} from "../../domain/repositories/LedgerEntryRepository.js";
import { toLedgerEntry } from "./ledgerMappers.js";

export class PrismaLedgerEntryRepository implements LedgerEntryRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateLedgerEntryInput): Promise<LedgerEntry> {
    try {
      const entry = await this.db.ledgerEntry.create({
        data: {
          ledgerTransactionId: input.ledgerTransactionId,
          ledgerAccountId: input.ledgerAccountId,
          entryType: input.entryType,
          amount: input.amount,
          balanceBefore: input.balanceBefore,
          balanceAfter: input.balanceAfter,
          description: input.description ?? null
        }
      });

      return toLedgerEntry(entry);
    } catch (error) {
      this.logger?.error({ error, ledgerAccountId: input.ledgerAccountId }, "Repository error: create ledger entry failed");
      throw error;
    }
  }

  public async findByTransactionId(transactionId: string): Promise<LedgerEntry[]> {
    try {
      const entries = await this.db.ledgerEntry.findMany({
        where: { ledgerTransactionId: transactionId },
        orderBy: { createdAt: "asc" }
      });

      return entries.map(toLedgerEntry);
    } catch (error) {
      this.logger?.error({ error, transactionId }, "Repository error: find ledger entries failed");
      throw error;
    }
  }

  public async getCurrentBalance(ledgerAccountId: string): Promise<string> {
    try {
      const latest = await this.db.ledgerEntry.findFirst({
        where: { ledgerAccountId },
        orderBy: { createdAt: "desc" }
      });

      return latest?.balanceAfter.toFixed(2) ?? "0.00";
    } catch (error) {
      this.logger?.error({ error, ledgerAccountId }, "Repository error: get ledger account balance failed");
      throw error;
    }
  }

  public async getBalancesByLedgerAccount(): Promise<LedgerAccountBalanceProjection[]> {
    try {
      const entries = await this.db.ledgerEntry.findMany({
        select: {
          ledgerAccountId: true,
          entryType: true,
          amount: true
        }
      });
      const balances = new Map<string, Money>();

      for (const entry of entries) {
        const current = balances.get(entry.ledgerAccountId) ?? Money.zero();
        const amount = Money.from(entry.amount.toFixed(2));
        const next = entry.entryType === "CREDIT" ? current.add(amount) : current.subtract(amount);
        balances.set(entry.ledgerAccountId, next);
      }

      return [...balances.entries()].map(([ledgerAccountId, balance]) => ({
        ledgerAccountId,
        balance: balance.toString()
      }));
    } catch (error) {
      this.logger?.error({ error }, "Repository error: get ledger balances failed");
      throw error;
    }
  }
}
