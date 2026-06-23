export class DuplicateAccountNumberError extends Error {
  public constructor(accountNumber: string) {
    super(`Account number already exists: ${accountNumber}`);
    this.name = "DuplicateAccountNumberError";
  }
}

export class DuplicateUpiIdError extends Error {
  public constructor(upiId: string) {
    super(`UPI ID already exists: ${upiId}`);
    this.name = "DuplicateUpiIdError";
  }
}
