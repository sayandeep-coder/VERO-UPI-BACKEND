import { BANK_DEFAULTS } from "../../constants/bankDefaults.js";

export class AccountNumberGenerator {
  public next(latestAccountNumber: string | null): string {
    const latest = latestAccountNumber ? Number(latestAccountNumber) : BANK_DEFAULTS.accountNumberSeed;

    if (!Number.isSafeInteger(latest)) {
      throw new Error("Latest account number is invalid");
    }

    return String(latest + 1);
  }
}
