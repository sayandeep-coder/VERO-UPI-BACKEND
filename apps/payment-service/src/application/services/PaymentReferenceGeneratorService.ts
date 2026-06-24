import { DuplicatePaymentReferenceError } from "../../domain/errors/PaymentDomainErrors.js";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository.js";
import { PaymentReferenceGenerator } from "../../domain/value-objects/PaymentReferenceGenerator.js";

export class PaymentReferenceGeneratorService {
  public constructor(
    private readonly payments: PaymentRepository,
    private readonly generator = new PaymentReferenceGenerator()
  ) {}

  public async generate(): Promise<string> {
    const latest = await this.payments.findLatestPaymentReference();
    return this.generator.next(latest);
  }

  public duplicate(reference: string): DuplicatePaymentReferenceError {
    return new DuplicatePaymentReferenceError(reference);
  }
}
