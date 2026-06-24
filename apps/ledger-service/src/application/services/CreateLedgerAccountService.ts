import { ConflictError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import { randomUUID } from "node:crypto";
import { LEDGER_DEFAULTS } from "../../constants/ledgerConstants.js";
import { LEDGER_EVENTS, type LedgerEventPublisher } from "../../domain/events/LedgerEvents.js";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import type { CreateLedgerAccountCommand } from "../commands/LedgerCommands.js";
import { toLedgerAccountDto, type LedgerAccountDto } from "../dto/LedgerDtos.js";

export class CreateLedgerAccountService {
  public constructor(
    private readonly ledgerAccounts: LedgerAccountRepository,
    private readonly events: LedgerEventPublisher,
    private readonly logger: Logger
  ) {}

  public async create(command: CreateLedgerAccountCommand): Promise<LedgerAccountDto> {
    if (command.bankAccountId) {
      const existing = await this.ledgerAccounts.findByBankAccountId(command.bankAccountId);

      if (existing) {
        return toLedgerAccountDto(existing);
      }
    }

    const account = await this.ledgerAccounts.create({
      userId: command.userId ?? null,
      bankAccountId: command.bankAccountId ?? null,
      accountType: command.accountType,
      accountName: command.accountName,
      status: LEDGER_DEFAULTS.statusActive
    });

    await this.events.publish(LEDGER_EVENTS.ledgerAccountCreated, {
      eventId: randomUUID(),
      ledgerAccountId: account.id,
      userId: account.userId,
      bankAccountId: account.bankAccountId,
      timestamp: new Date().toISOString()
    });

    this.logger.info({ ledgerAccountId: account.id, bankAccountId: account.bankAccountId }, "Ledger Account Created");

    return toLedgerAccountDto(account);
  }

  public async createForBankAccount(userId: string, bankAccountId: string, accountNumber: string): Promise<void> {
    const existing = await this.ledgerAccounts.findByBankAccountId(bankAccountId);

    if (existing) {
      return;
    }

    await this.create({
      userId,
      bankAccountId,
      accountType: "USER",
      accountName: `VERO Bank Account ${accountNumber}`
    });
  }

  public async assertNotDuplicateBankAccount(bankAccountId: string): Promise<void> {
    const existing = await this.ledgerAccounts.findByBankAccountId(bankAccountId);

    if (existing) {
      throw new ConflictError("Ledger account already exists for bank account");
    }
  }
}
