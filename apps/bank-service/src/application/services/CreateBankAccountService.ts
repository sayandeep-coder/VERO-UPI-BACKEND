import { NotFoundError, ValidationError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import { randomUUID } from "node:crypto";
import { BANK_DEFAULTS } from "../../constants/bankDefaults.js";
import { BANK_EVENTS, type BankEventPublisher } from "../../domain/events/BankEvents.js";
import { DuplicateAccountNumberError } from "../../domain/errors/BankDomainErrors.js";
import type { AccountLimitRepository } from "../../domain/repositories/AccountLimitRepository.js";
import type { BankAccountRepository } from "../../domain/repositories/BankAccountRepository.js";
import type { BankUserRepository } from "../../domain/repositories/BankUserRepository.js";
import { AccountNumberGenerator } from "../../domain/value-objects/AccountNumberGenerator.js";
import type { CreateBankAccountCommand } from "../commands/CreateBankAccountCommand.js";
import type { CreateBankAccountResponseDto } from "../dto/BankDtos.js";
import type { GenerateUpiIdService } from "./GenerateUpiIdService.js";

export class CreateBankAccountService {
  public constructor(
    private readonly users: BankUserRepository,
    private readonly bankAccounts: BankAccountRepository,
    private readonly accountLimits: AccountLimitRepository,
    private readonly generateUpiIdService: GenerateUpiIdService,
    private readonly events: BankEventPublisher,
    private readonly logger: Logger,
    private readonly accountNumberGenerator = new AccountNumberGenerator()
  ) {}

  public async create(command: CreateBankAccountCommand): Promise<CreateBankAccountResponseDto> {
    const user = await this.users.findById(command.userId);

    if (!user) {
      this.logger.warn({ userId: command.userId }, "Validation failed: user does not exist");
      throw new NotFoundError("User was not found");
    }

    if (user.status !== "ACTIVE") {
      this.logger.warn({ userId: command.userId, status: user.status }, "Validation failed: user is not active");
      throw new ValidationError("User is not active");
    }

    const isFirstAccount = !(await this.bankAccounts.existsForUser(command.userId));
    const account = await this.createAccountWithSequentialNumber(command.userId, isFirstAccount);

    await this.accountLimits.create({
      userId: command.userId,
      bankAccountId: account.id,
      dailyLimit: BANK_DEFAULTS.dailyLimit,
      monthlyLimit: BANK_DEFAULTS.monthlyLimit,
      dailyUsedAmount: BANK_DEFAULTS.zeroAmount,
      monthlyUsedAmount: BANK_DEFAULTS.zeroAmount,
      currency: BANK_DEFAULTS.currency,
      status: BANK_DEFAULTS.accountStatus
    });

    const upi = await this.generateUpiIdService.generate({
      userId: command.userId,
      bankAccountId: account.id,
      accountNumber: account.accountNumber,
      fullName: user.fullName,
      isPrimary: isFirstAccount
    });

    const timestamp = new Date().toISOString();

    await this.events.publishBankAccountCreated({
      eventId: randomUUID(),
      userId: command.userId,
      accountId: account.id,
      accountNumber: account.accountNumber,
      timestamp
    });
    await this.events.publishUpiIdCreated({
      eventId: randomUUID(),
      userId: command.userId,
      accountId: account.id,
      upiId: upi.upiId,
      timestamp
    });

    this.logger.info(
      { userId: command.userId, accountId: account.id, event: BANK_EVENTS.bankAccountCreated },
      "Account Created"
    );
    this.logger.info({ userId: command.userId, accountId: account.id, upiId: upi.upiId }, "UPI Generated");

    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      upiId: upi.upiId
    };
  }

  private async createAccountWithSequentialNumber(userId: string, isPrimary: boolean) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const latestAccountNumber = await this.bankAccounts.findLatestAccountNumber();
      const accountNumber = this.accountNumberGenerator.next(latestAccountNumber);

      try {
        return await this.bankAccounts.create({
          userId,
          accountNumber,
          ifscCode: BANK_DEFAULTS.ifscCode,
          bankName: BANK_DEFAULTS.bankName,
          accountType: BANK_DEFAULTS.accountType,
          currentBalance: BANK_DEFAULTS.zeroAmount,
          availableBalance: BANK_DEFAULTS.zeroAmount,
          currency: BANK_DEFAULTS.currency,
          isPrimary,
          status: BANK_DEFAULTS.accountStatus
        });
      } catch (error) {
        if (error instanceof DuplicateAccountNumberError) {
          this.logger.warn({ accountNumber, attempt }, "Sequential account number collision; retrying");
          continue;
        }

        throw error;
      }
    }

    throw new DuplicateAccountNumberError("next sequential account number");
  }
}
