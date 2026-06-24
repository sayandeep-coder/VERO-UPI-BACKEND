import { ValidationError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import type { LedgerEntryRepository } from "../../domain/repositories/LedgerEntryRepository.js";
import { Money } from "../../domain/value-objects/Money.js";
import type { CreateLedgerEntryCommand } from "../commands/LedgerCommands.js";
import { toLedgerEntryDto, type LedgerEntryDto } from "../dto/LedgerDtos.js";

export class CreateCreditEntryService {
  public constructor(
    private readonly ledgerEntries: LedgerEntryRepository,
    private readonly logger: Logger
  ) {}

  public async create(command: CreateLedgerEntryCommand): Promise<LedgerEntryDto> {
    const amount = Money.from(command.amount);

    if (!amount.isPositive()) {
      throw new ValidationError("Credit amount must be greater than zero");
    }

    const balanceBefore = Money.from(await this.ledgerEntries.getCurrentBalance(command.ledgerAccountId));
    const balanceAfter = balanceBefore.add(amount);

    const entry = await this.ledgerEntries.create({
      ledgerTransactionId: command.ledgerTransactionId,
      ledgerAccountId: command.ledgerAccountId,
      entryType: "CREDIT",
      amount: amount.toString(),
      balanceBefore: balanceBefore.toString(),
      balanceAfter: balanceAfter.toString(),
      description: command.description ?? null
    });

    this.logger.info({ ledgerEntryId: entry.id, ledgerAccountId: entry.ledgerAccountId }, "Credit Entry Created");

    return toLedgerEntryDto(entry);
  }
}
