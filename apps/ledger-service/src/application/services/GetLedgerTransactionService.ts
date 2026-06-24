import { ForbiddenError, NotFoundError } from "@vero/shared-errors";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import type { LedgerTransactionRepository } from "../../domain/repositories/LedgerTransactionRepository.js";
import { toLedgerTransactionDto, type LedgerTransactionDto } from "../dto/LedgerDtos.js";
import type { LedgerTransactionQuery } from "../queries/LedgerQueries.js";

export class GetLedgerTransactionService {
  public constructor(
    private readonly ledgerTransactions: LedgerTransactionRepository,
    private readonly ledgerAccounts: LedgerAccountRepository
  ) {}

  public async get(query: LedgerTransactionQuery): Promise<LedgerTransactionDto> {
    const transaction = await this.ledgerTransactions.findByIdWithEntries(query.transactionId);

    if (!transaction) {
      throw new NotFoundError("Ledger transaction was not found");
    }

    const entries = transaction.entries ?? [];

    for (const entry of entries) {
      const account = await this.ledgerAccounts.findById(entry.ledgerAccountId);

      if (account?.userId && account.userId !== query.userId) {
        throw new ForbiddenError("Ledger transaction contains an account outside the authenticated user");
      }
    }

    return toLedgerTransactionDto(transaction);
  }
}
