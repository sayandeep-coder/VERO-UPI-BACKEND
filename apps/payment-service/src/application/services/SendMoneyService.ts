import { AppError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import { randomUUID } from "node:crypto";
import { PAYMENT_DEFAULTS } from "../../constants/paymentConstants.js";
import { DuplicatePaymentReferenceError } from "../../domain/errors/PaymentDomainErrors.js";
import { PAYMENT_EVENTS, type PaymentEventPublisher } from "../../domain/events/PaymentEvents.js";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository.js";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import type { SendMoneyCommand } from "../commands/PaymentCommands.js";
import type { SendMoneyResponseDto } from "../dto/PaymentDtos.js";
import type { LedgerServiceClient } from "./LedgerServiceClient.js";
import type { PaymentReferenceGeneratorService } from "./PaymentReferenceGeneratorService.js";
import type { PaymentValidationService } from "./PaymentValidationService.js";

export class SendMoneyService {
  public constructor(
    private readonly payments: PaymentRepository,
    private readonly transactions: TransactionRepository,
    private readonly validator: PaymentValidationService,
    private readonly referenceGenerator: PaymentReferenceGeneratorService,
    private readonly ledger: LedgerServiceClient,
    private readonly events: PaymentEventPublisher,
    private readonly logger: Logger
  ) {}

  public async send(command: SendMoneyCommand): Promise<SendMoneyResponseDto> {
    const validation = await this.validator.validate(command.senderUserId, command.receiverUpiId, command.amount);
    const paymentReference = await this.referenceGenerator.generate();

    let payment;
    try {
      payment = await this.payments.create({
        paymentReference,
        senderUserId: command.senderUserId,
        receiverUserId: validation.receiver.id,
        senderBankAccountId: validation.senderBankAccount.id,
        receiverBankAccountId: validation.receiverBankAccount.id,
        senderUpiId: validation.senderUpi.upiId,
        receiverUpiId: validation.receiverUpi.upiId,
        amount: validation.amount.toString(),
        remarks: command.remarks ?? null,
        paymentType: PAYMENT_DEFAULTS.paymentTypeP2p,
        status: PAYMENT_DEFAULTS.statusPending
      });
    } catch (error) {
      if (error instanceof DuplicatePaymentReferenceError) {
        throw this.referenceGenerator.duplicate(paymentReference);
      }
      throw error;
    }

    await this.events.publish(PAYMENT_EVENTS.paymentInitiated, this.eventPayload(payment.id, payment.paymentReference, payment.amount));
    this.logger.info({ paymentId: payment.id, paymentReference }, "Payment Initiated");

    try {
      await this.payments.updateStatus(payment.id, PAYMENT_DEFAULTS.statusProcessing);
      const ledgerInput = {
        referenceType: PAYMENT_DEFAULTS.ledgerReferenceType,
        referenceId: payment.id,
        description: command.remarks ?? PAYMENT_DEFAULTS.ledgerEntryDescription,
        senderLedgerAccountId: validation.senderLedgerAccount.id,
        receiverLedgerAccountId: validation.receiverLedgerAccount.id,
        amount: payment.amount
      };

      if (command.authorizationHeader) {
        Object.assign(ledgerInput, { authorizationHeader: command.authorizationHeader });
      }

      const ledgerResult = await this.ledger.createP2pPosting(ledgerInput);

      const completed = await this.payments.complete(payment.id, {
        ledgerTransactionId: ledgerResult.ledgerTransactionId,
        completedAt: new Date()
      });

      await this.transactions.createMany([
        {
          paymentId: completed.id,
          userId: completed.senderUserId,
          transactionDirection: "DEBIT",
          counterpartyName: validation.receiver.fullName,
          counterpartyUpiId: completed.receiverUpiId,
          amount: completed.amount,
          transactionCategory: PAYMENT_DEFAULTS.transactionCategoryTransfer,
          transactionStatus: PAYMENT_DEFAULTS.statusCompleted
        },
        {
          paymentId: completed.id,
          userId: completed.receiverUserId,
          transactionDirection: "CREDIT",
          counterpartyName: validation.sender.fullName,
          counterpartyUpiId: completed.senderUpiId,
          amount: completed.amount,
          transactionCategory: PAYMENT_DEFAULTS.transactionCategoryTransfer,
          transactionStatus: PAYMENT_DEFAULTS.statusCompleted
        }
      ]);

      await this.events.publish(
        PAYMENT_EVENTS.paymentCompleted,
        this.eventPayload(completed.id, completed.paymentReference, completed.amount)
      );
      this.logger.info({ paymentId: completed.id, ledgerTransactionId: completed.ledgerTransactionId }, "Payment Completed");

      return {
        paymentId: completed.id,
        paymentReference: completed.paymentReference,
        status: completed.status
      };
    } catch (error) {
      this.logger.error({ error, paymentId: payment.id }, "Ledger Failure");
      const failed = await this.payments.fail(payment.id, new Date());
      await this.events.publish(PAYMENT_EVENTS.paymentFailed, this.eventPayload(failed.id, failed.paymentReference, failed.amount));
      this.logger.info({ paymentId: failed.id }, "Payment Failed");

      if (error instanceof AppError) {
        throw error;
      }

      throw error;
    }
  }

  private eventPayload(paymentId: string, paymentReference: string, amount: string) {
    return {
      eventId: randomUUID(),
      paymentId,
      paymentReference,
      amount,
      timestamp: new Date().toISOString()
    };
  }
}
