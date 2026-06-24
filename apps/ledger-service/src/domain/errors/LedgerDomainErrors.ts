import { ConflictError, ValidationError } from "@vero/shared-errors";

export class UnbalancedLedgerTransactionError extends ValidationError {
  public constructor() {
    super("Total debit amount must equal total credit amount");
  }
}

export class DuplicateReversalError extends ConflictError {
  public constructor() {
    super("Ledger transaction has already been reversed");
  }
}

export class ImmutableLedgerTransactionError extends ConflictError {
  public constructor() {
    super("Completed ledger transactions are immutable");
  }
}
