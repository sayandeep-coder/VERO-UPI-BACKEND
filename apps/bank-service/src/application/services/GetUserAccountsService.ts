import type { BankAccountRepository } from "../../domain/repositories/BankAccountRepository.js";
import { toBankAccountDto, type BankAccountDto } from "../dto/BankDtos.js";
import type { UserScopedQuery } from "../queries/BankQueries.js";

export class GetUserAccountsService {
  public constructor(private readonly bankAccounts: BankAccountRepository) {}

  public async list(query: UserScopedQuery): Promise<BankAccountDto[]> {
    const accounts = await this.bankAccounts.findByUserId(query.userId);
    return accounts.map(toBankAccountDto);
  }
}
