import type { Logger } from "@vero/shared-logger";
import type { BankAccountReadRepository } from "../../domain/repositories/BankAccountReadRepository.js";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import type { LedgerEntryRepository } from "../../domain/repositories/LedgerEntryRepository.js";
import { Money } from "../../domain/value-objects/Money.js";
import type { ReconciliationReportDto } from "../dto/LedgerDtos.js";

export class ReconciliationService {
  public constructor(
    private readonly ledgerAccounts: LedgerAccountRepository,
    private readonly ledgerEntries: LedgerEntryRepository,
    private readonly bankAccounts: BankAccountReadRepository,
    private readonly logger: Logger
  ) {}

  public async run(): Promise<ReconciliationReportDto> {
    const accounts = (await this.ledgerAccounts.findAllActive()).filter((account) => account.bankAccountId);
    const balances = new Map(
      (await this.ledgerEntries.getBalancesByLedgerAccount()).map((projection) => [
        projection.ledgerAccountId,
        projection.balance
      ])
    );
    const mismatches: ReconciliationReportDto["mismatches"] = [];

    for (const account of accounts) {
      if (!account.bankAccountId) {
        continue;
      }

      const bankBalance = await this.bankAccounts.findBalanceById(account.bankAccountId);

      if (!bankBalance) {
        continue;
      }

      const ledgerBalance = balances.get(account.id) ?? "0.00";

      if (!Money.from(ledgerBalance).equals(Money.from(bankBalance.currentBalance))) {
        mismatches.push({
          bankAccountId: account.bankAccountId,
          ledgerAccountId: account.id,
          ledgerBalance,
          bankCurrentBalance: bankBalance.currentBalance,
          bankAvailableBalance: bankBalance.availableBalance
        });
      }
    }

    const report = {
      checkedAccounts: accounts.length,
      mismatchCount: mismatches.length,
      mismatches,
      generatedAt: new Date().toISOString()
    };

    this.logger.info({ checkedAccounts: report.checkedAccounts, mismatchCount: report.mismatchCount }, "Reconciliation Run");

    return report;
  }
}
