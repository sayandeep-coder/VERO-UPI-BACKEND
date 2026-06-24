import { NotFoundError, ValidationError } from "@vero/shared-errors";
import type {
  BankAccountProfile,
  BankAccountReadRepository,
  LedgerAccountProfile,
  LedgerAccountReadRepository,
  UpiIdProfile,
  UpiIdReadRepository,
  UserProfile,
  UserReadRepository
} from "../../domain/repositories/PaymentReadRepositories.js";
import { Money } from "../../domain/value-objects/Money.js";

export interface PaymentValidationResult {
  sender: UserProfile;
  receiver: UserProfile;
  senderUpi: UpiIdProfile;
  receiverUpi: UpiIdProfile;
  senderBankAccount: BankAccountProfile;
  receiverBankAccount: BankAccountProfile;
  senderLedgerAccount: LedgerAccountProfile;
  receiverLedgerAccount: LedgerAccountProfile;
  amount: Money;
}

export class PaymentValidationService {
  public constructor(
    private readonly users: UserReadRepository,
    private readonly upiIds: UpiIdReadRepository,
    private readonly bankAccounts: BankAccountReadRepository,
    private readonly ledgerAccounts: LedgerAccountReadRepository
  ) {}

  public async validate(senderUserId: string, receiverUpiId: string, amountInput: string): Promise<PaymentValidationResult> {
    const amount = Money.from(amountInput);

    if (!amount.isPositive()) {
      throw new ValidationError("Amount must be greater than zero");
    }

    const sender = await this.users.findById(senderUserId);
    if (!sender) throw new NotFoundError("Sender was not found");
    if (sender.status !== "ACTIVE") throw new ValidationError("Sender is not active");

    const senderUpi = await this.upiIds.findPrimaryByUser(senderUserId);
    if (!senderUpi) throw new NotFoundError("Sender UPI ID was not found");
    if (senderUpi.status !== "ACTIVE") throw new ValidationError("Sender UPI ID is not active");

    const receiverUpi = await this.upiIds.findByUpiId(receiverUpiId);
    if (!receiverUpi) throw new NotFoundError("Receiver UPI ID was not found");
    if (receiverUpi.status !== "ACTIVE") throw new ValidationError("Receiver UPI ID is not active");
    if (receiverUpi.userId === senderUserId) throw new ValidationError("Self transfer is not enabled for this flow");

    const receiver = await this.users.findById(receiverUpi.userId);
    if (!receiver) throw new NotFoundError("Receiver was not found");
    if (receiver.status !== "ACTIVE") throw new ValidationError("Receiver is not active");

    const senderBankAccount = await this.bankAccounts.findById(senderUpi.bankAccountId);
    if (!senderBankAccount) throw new NotFoundError("Sender bank account was not found");
    if (senderBankAccount.userId !== senderUserId) throw new ValidationError("Sender bank account ownership mismatch");
    if (senderBankAccount.status !== "ACTIVE") throw new ValidationError("Sender bank account is not active");

    const receiverBankAccount = await this.bankAccounts.findById(receiverUpi.bankAccountId);
    if (!receiverBankAccount) throw new NotFoundError("Receiver bank account was not found");
    if (receiverBankAccount.userId !== receiverUpi.userId) throw new ValidationError("Receiver bank account ownership mismatch");
    if (receiverBankAccount.status !== "ACTIVE") throw new ValidationError("Receiver bank account is not active");

    if (amount.isGreaterThan(Money.from(senderBankAccount.availableBalance))) {
      throw new ValidationError("Insufficient balance");
    }

    const senderLedgerAccount = await this.ledgerAccounts.findByBankAccountId(senderBankAccount.id);
    if (!senderLedgerAccount) throw new NotFoundError("Sender ledger account was not found");
    if (senderLedgerAccount.status !== "ACTIVE") throw new ValidationError("Sender ledger account is not active");

    const receiverLedgerAccount = await this.ledgerAccounts.findByBankAccountId(receiverBankAccount.id);
    if (!receiverLedgerAccount) throw new NotFoundError("Receiver ledger account was not found");
    if (receiverLedgerAccount.status !== "ACTIVE") throw new ValidationError("Receiver ledger account is not active");

    return {
      sender,
      receiver,
      senderUpi,
      receiverUpi,
      senderBankAccount,
      receiverBankAccount,
      senderLedgerAccount,
      receiverLedgerAccount,
      amount
    };
  }
}
