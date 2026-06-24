import { ForbiddenError, NotFoundError, ValidationError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import { randomUUID } from "node:crypto";
import { LEDGER_DEFAULTS } from "../../constants/ledgerConstants.js";
import { UnbalancedLedgerTransactionError } from "../../domain/errors/LedgerDomainErrors.js";
import { LEDGER_EVENTS, type LedgerEventPublisher } from "../../domain/events/LedgerEvents.js";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import type { LedgerTransactionRepository } from "../../domain/repositories/LedgerTransactionRepository.js";
import { Money } from "../../domain/value-objects/Money.js";
import type { CreateLedgerTransactionCommand } from "../commands/LedgerCommands.js";
import { toLedgerTransactionDto, type LedgerTransactionDto } from "../dto/LedgerDtos.js";
import type { CreateCreditEntryService } from "./CreateCreditEntryService.js";
import type { CreateDebitEntryService } from "./CreateDebitEntryService.js";

export class CreateLedgerTransactionService {
  public constructor(
    private readonly ledgerAccounts: LedgerAccountRepository,
    private readonly ledgerTransactions: LedgerTransactionRepository,
    private readonly createDebitEntryService: CreateDebitEntryService,
    private readonly createCreditEntryService: CreateCreditEntryService,
    private readonly events: LedgerEventPublisher,
    private readonly logger: Logger
  ) {}

  public async create(command: CreateLedgerTransactionCommand): Promise<LedgerTransactionDto> {
    this.validateEntries(command.entries);

    for (const entry of command.entries) {
      const account = await this.ledgerAccounts.findById(entry.ledgerAccountId);

      if (!account) {
        throw new NotFoundError("Ledger account was not found");
      }

      if (account.status !== LEDGER_DEFAULTS.statusActive) {
        throw new ValidationError("Ledger account is not active");
      }

      if (account.userId && account.userId !== command.userId) {
        throw new ForbiddenError("Ledger account does not belong to the authenticated user");
      }
    }

    const totalAmount = this.calculateTotal(command.entries, "DEBIT");
    const transaction = await this.ledgerTransactions.create({
      referenceType: command.referenceType,
      referenceId: command.referenceId ?? null,
      description: command.description ?? null,
      totalAmount: totalAmount.toString(),
      status: LEDGER_DEFAULTS.statusPending
    });

    await this.events.publish(LEDGER_EVENTS.ledgerTransactionCreated, {
      eventId: randomUUID(),
      ledgerTransactionId: transaction.id,
      referenceType: transaction.referenceType,
      referenceId: transaction.referenceId,
      totalAmount: transaction.totalAmount,
      timestamp: new Date().toISOString()
    });

    const createdEntries = [];

    for (const entry of command.entries) {
      const created =
        entry.entryType === "DEBIT"
          ? await this.createDebitEntryService.create({
              ledgerTransactionId: transaction.id,
              ledgerAccountId: entry.ledgerAccountId,
              amount: entry.amount,
              description: entry.description ?? null
            })
          : await this.createCreditEntryService.create({
              ledgerTransactionId: transaction.id,
              ledgerAccountId: entry.ledgerAccountId,
              amount: entry.amount,
              description: entry.description ?? null
            });

      createdEntries.push(created);
      await this.events.publish(LEDGER_EVENTS.ledgerEntryCreated, {
        eventId: randomUUID(),
        ledgerTransactionId: transaction.id,
        ledgerEntryId: created.id,
        ledgerAccountId: created.ledgerAccountId,
        entryType: created.entryType,
        amount: created.amount,
        timestamp: new Date().toISOString()
      });
    }

    const completed = await this.ledgerTransactions.updateStatus(transaction.id, LEDGER_DEFAULTS.statusCompleted);

    this.logger.info({ ledgerTransactionId: transaction.id }, "Ledger Transaction Created");

    return toLedgerTransactionDto({
      ...completed,
      entries: createdEntries.map((entry) => ({
        id: entry.id,
        ledgerTransactionId: entry.ledgerTransactionId,
        ledgerAccountId: entry.ledgerAccountId,
        entryType: entry.entryType === "DEBIT" ? "DEBIT" : "CREDIT",
        amount: entry.amount,
        balanceBefore: entry.balanceBefore,
        balanceAfter: entry.balanceAfter,
        description: entry.description,
        createdAt: new Date(entry.createdAt)
      }))
    });
  }

  private validateEntries(entries: CreateLedgerTransactionCommand["entries"]): void {
    if (entries.length < 2) {
      this.logger.warn({ entries: entries.length }, "Validation failed: ledger transaction needs at least two entries");
      throw new ValidationError("Ledger transaction must contain at least two entries");
    }

    const debitTotal = this.calculateTotal(entries, "DEBIT");
    const creditTotal = this.calculateTotal(entries, "CREDIT");

    if (!debitTotal.isPositive() || !creditTotal.isPositive()) {
      throw new ValidationError("Ledger transaction must contain at least one debit and one credit");
    }

    if (!debitTotal.equals(creditTotal)) {
      this.logger.warn({ debitTotal: debitTotal.toString(), creditTotal: creditTotal.toString() }, "Validation failed: debit and credit mismatch");
      throw new UnbalancedLedgerTransactionError();
    }
  }

  private calculateTotal(entries: CreateLedgerTransactionCommand["entries"], entryType: "DEBIT" | "CREDIT"): Money {
    return entries
      .filter((entry) => entry.entryType === entryType)
      .reduce((total, entry) => total.add(Money.from(entry.amount)), Money.zero());
  }
}
