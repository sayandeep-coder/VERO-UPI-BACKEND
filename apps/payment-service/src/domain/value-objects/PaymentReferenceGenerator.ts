import { PAYMENT_DEFAULTS } from "../../constants/paymentConstants.js";

export class PaymentReferenceGenerator {
  public next(latestReference: string | null): string {
    const latestNumber =
      latestReference?.startsWith(PAYMENT_DEFAULTS.referencePrefix)
        ? Number(latestReference.slice(PAYMENT_DEFAULTS.referencePrefix.length))
        : PAYMENT_DEFAULTS.referenceSeed;

    if (!Number.isSafeInteger(latestNumber)) {
      throw new Error("Latest payment reference is invalid");
    }

    return `${PAYMENT_DEFAULTS.referencePrefix}${String(latestNumber + 1).padStart(6, "0")}`;
  }
}
