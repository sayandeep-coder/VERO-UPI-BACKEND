import { NotFoundError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import type { BankAccountRepository } from "../../domain/repositories/BankAccountRepository.js";
import type { BalanceDto } from "../dto/BankDtos.js";
import type { UserScopedQuery } from "../queries/BankQueries.js";

export class GetBalanceService {
  public constructor(
    private readonly bankAccounts: BankAccountRepository,
    private readonly logger: Logger
  ) {}

  public async get(query: UserScopedQuery): Promise<BalanceDto> {
    const accounts = await this.bankAccounts.findByUserId(query.userId);
    const account = accounts.find((item) => item.isPrimary) ?? accounts[0];

    if (!account) {
      throw new NotFoundError("Bank account was not found");
    }

    this.logger.info({ userId: query.userId, accountId: account.id }, "Balance Retrieved");

    return {
      currentBalance: account.currentBalance,
      availableBalance: account.availableBalance
    };
  }
}
