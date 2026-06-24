import { NotFoundError } from "@vero/shared-errors";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import { toTransactionDto, type TransactionDto } from "../dto/PaymentDtos.js";
import type { UserScopedTransactionQuery } from "../queries/PaymentQueries.js";

export class GetTransactionDetailsService {
  public constructor(private readonly transactions: TransactionRepository) {}

  public async get(query: UserScopedTransactionQuery): Promise<TransactionDto> {
    const transaction = await this.transactions.findByUser(query.transactionId, query.userId);
    if (!transaction) throw new NotFoundError("Transaction was not found");
    return toTransactionDto(transaction);
  }
}
