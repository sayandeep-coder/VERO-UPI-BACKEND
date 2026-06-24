import { ForbiddenError, NotFoundError } from "@vero/shared-errors";
import type { LedgerAccountRepository } from "../../domain/repositories/LedgerAccountRepository.js";
import { toLedgerAccountDto, type LedgerAccountDto } from "../dto/LedgerDtos.js";
import type { LedgerAccountQuery } from "../queries/LedgerQueries.js";

export class GetLedgerAccountService {
  public constructor(private readonly ledgerAccounts: LedgerAccountRepository) {}

  public async get(query: LedgerAccountQuery): Promise<LedgerAccountDto> {
    const account = await this.ledgerAccounts.findById(query.accountId);

    if (!account) {
      throw new NotFoundError("Ledger account was not found");
    }

    if (account.userId && account.userId !== query.userId) {
      throw new ForbiddenError("Ledger account does not belong to the authenticated user");
    }

    return toLedgerAccountDto(account);
  }
}
