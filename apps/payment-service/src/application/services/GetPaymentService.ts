import { NotFoundError } from "@vero/shared-errors";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository.js";
import { toPaymentDto, type PaymentDto } from "../dto/PaymentDtos.js";
import type { UserScopedPaymentQuery } from "../queries/PaymentQueries.js";

export class GetPaymentService {
  public constructor(private readonly payments: PaymentRepository) {}

  public async get(query: UserScopedPaymentQuery): Promise<PaymentDto> {
    const payment = await this.payments.findByUser(query.paymentId, query.userId);
    if (!payment) throw new NotFoundError("Payment was not found");
    return toPaymentDto(payment);
  }
}
