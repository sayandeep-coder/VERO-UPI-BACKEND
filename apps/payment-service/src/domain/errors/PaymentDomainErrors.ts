import { ConflictError } from "@vero/shared-errors";

export class DuplicatePaymentReferenceError extends ConflictError {
  public constructor(reference: string) {
    super("Payment reference already exists", { paymentReference: reference });
  }
}
