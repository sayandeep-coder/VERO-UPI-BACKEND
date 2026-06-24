import { ValidationError } from "@vero/shared-errors";

export class Money {
  private readonly cents: bigint;

  private constructor(cents: bigint) {
    this.cents = cents;
  }

  public static from(value: string | number): Money {
    const text = String(value).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      throw new ValidationError("Amount must be a positive decimal with up to two places");
    }

    const [whole = "0", fraction = ""] = text.split(".");
    return new Money(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
  }

  public isPositive(): boolean {
    return this.cents > 0n;
  }

  public isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  public toString(): string {
    const whole = this.cents / 100n;
    const fraction = String(this.cents % 100n).padStart(2, "0");
    return `${whole}.${fraction}`;
  }
}
