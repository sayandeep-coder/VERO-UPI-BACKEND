import { ValidationError } from "@vero/shared-errors";

export class Money {
  private readonly cents: bigint;

  private constructor(cents: bigint) {
    this.cents = cents;
  }

  public static zero(): Money {
    return new Money(0n);
  }

  public static from(value: string | number): Money {
    const text = String(value).trim();

    if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
      throw new ValidationError("Amount must be a decimal with up to two places");
    }

    const sign = text.startsWith("-") ? -1n : 1n;
    const normalized = text.replace("-", "");
    const [whole = "0", fraction = ""] = normalized.split(".");
    const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));

    return new Money(cents * sign);
  }

  public add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  public subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  public equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  public isPositive(): boolean {
    return this.cents > 0n;
  }

  public isNegative(): boolean {
    return this.cents < 0n;
  }

  public toString(): string {
    const sign = this.cents < 0n ? "-" : "";
    const absolute = this.cents < 0n ? -this.cents : this.cents;
    const whole = absolute / 100n;
    const fraction = String(absolute % 100n).padStart(2, "0");

    return `${sign}${whole}.${fraction}`;
  }
}
