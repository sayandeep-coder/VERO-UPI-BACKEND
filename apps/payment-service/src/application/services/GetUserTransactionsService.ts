import type { Logger } from "@vero/shared-logger";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import { toTransactionDto, type TransactionDto } from "../dto/PaymentDtos.js";
import type { PaginatedUserQuery } from "../queries/PaymentQueries.js";

export class GetUserTransactionsService {
  public constructor(
    private readonly transactions: TransactionRepository,
    private readonly logger: Logger
  ) {}

  public async list(query: PaginatedUserQuery): Promise<TransactionDto[]> {
    const transactions = await this.transactions.findByUserId(query);
    this.logger.info({ userId: query.userId, count: transactions.length }, "Transaction History Retrieval");
    return transactions.map(toTransactionDto);
  }
}
