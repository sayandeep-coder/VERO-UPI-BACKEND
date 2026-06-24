import type { Logger } from "@vero/shared-logger";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository.js";
import { toPaymentDto, type PaymentDto } from "../dto/PaymentDtos.js";
import type { PaginatedUserQuery } from "../queries/PaymentQueries.js";

export class GetPaymentHistoryService {
  public constructor(
    private readonly payments: PaymentRepository,
    private readonly logger: Logger
  ) {}

  public async list(query: PaginatedUserQuery): Promise<PaymentDto[]> {
    const payments = await this.payments.findHistory(query);
    this.logger.info({ userId: query.userId, count: payments.length }, "Transaction History Retrieval");
    return payments.map(toPaymentDto);
  }
}
