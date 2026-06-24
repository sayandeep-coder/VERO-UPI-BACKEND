import { ForbiddenError, NotFoundError, ValidationError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import { randomUUID } from "node:crypto";
import { LEDGER_DEFAULTS } from "../../constants/ledgerConstants.js";
import { DuplicateReversalError } from "../../domain/errors/LedgerDomainErrors.js";
import { LEDGER_EVENTS, type LedgerEventPublisher } from "../../domain/events/LedgerEvents.js";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import type { LedgerTransactionRepository } from "../../domain/repositories/LedgerTransactionRepository.js";
import type { LedgerTransactionDto } from "../dto/LedgerDtos.js";
import type { CreateLedgerTransactionService } from "./CreateLedgerTransactionService.js";

export class ReverseLedgerTransactionService {
  public constructor(
    private readonly ledgerTransactions: LedgerTransactionRepository,
    private readonly ledgerAccounts: LedgerAccountRepository,
    private readonly createLedgerTransactionService: CreateLedgerTransactionService,
    private readonly events: LedgerEventPublisher,
    private readonly logger: Logger
  ) {}

  public async reverse(transactionId: string, userId: string): Promise<LedgerTransactionDto> {
    const original = await this.ledgerTransactions.findByIdWithEntries(transactionId);

    if (!original) {
      throw new NotFoundError("Ledger transaction was not found");
    }

    if (original.status === LEDGER_DEFAULTS.statusReversed) {
      throw new DuplicateReversalError();
    }

    if (original.status !== LEDGER_DEFAULTS.statusCompleted) {
      throw new ValidationError("Only completed ledger transactions can be reversed");
    }

    const duplicate = await this.ledgerTransactions.findByReference(LEDGER_DEFAULTS.referenceReversal, transactionId);

    if (duplicate) {
      throw new DuplicateReversalError();
    }

    for (const entry of original.entries ?? []) {
      const account = await this.ledgerAccounts.findById(entry.ledgerAccountId);

      if (account?.userId && account.userId !== userId) {
        throw new ForbiddenError("Ledger transaction contains an account outside the authenticated user");
      }
    }

    const reversed = await this.createLedgerTransactionService.create({
      userId,
      referenceType: LEDGER_DEFAULTS.referenceReversal,
      referenceId: original.id,
      description: `Reversal for ledger transaction ${original.id}`,
      entries: (original.entries ?? []).map((entry) => ({
        ledgerAccountId: entry.ledgerAccountId,
        entryType: entry.entryType === "DEBIT" ? "CREDIT" : "DEBIT",
        amount: entry.amount,
        description: `Reversal of ${entry.id}`
      }))
    });

    await this.ledgerTransactions.updateStatus(original.id, LEDGER_DEFAULTS.statusReversed);
    await this.events.publish(LEDGER_EVENTS.ledgerTransactionReversed, {
      eventId: randomUUID(),
      originalLedgerTransactionId: original.id,
      reversalLedgerTransactionId: reversed.id,
      timestamp: new Date().toISOString()
    });

    this.logger.info({ ledgerTransactionId: original.id, reversalLedgerTransactionId: reversed.id }, "Transaction Reversed");

    return reversed;
  }
}
