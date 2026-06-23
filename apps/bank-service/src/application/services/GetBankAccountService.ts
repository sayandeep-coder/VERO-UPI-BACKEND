import { ForbiddenError, NotFoundError } from "@vero/shared-errors";
import type { BankAccountRepository } from "../../domain/repositories/BankAccountRepository.js";
import { toBankAccountDto, type BankAccountDto } from "../dto/BankDtos.js";
import type { UserScopedAccountQuery } from "../queries/BankQueries.js";

export class GetBankAccountService {
  public constructor(private readonly bankAccounts: BankAccountRepository) {}

  public async get(query: UserScopedAccountQuery): Promise<BankAccountDto> {
    const account = await this.bankAccounts.findById(query.accountId);

    if (!account) {
      throw new NotFoundError("Bank account was not found");
    }

    if (account.userId !== query.userId) {
      throw new ForbiddenError("Bank account does not belong to the authenticated user");
    }

    return toBankAccountDto(account);
  }
}
