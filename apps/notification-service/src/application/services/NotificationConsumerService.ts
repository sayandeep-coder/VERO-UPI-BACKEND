import type { Logger } from "@vero/shared-logger";
import {
  type BankAccountCreatedEvent,
  type PaymentCompletedEvent,
  type PaymentFailedEvent,
  type UpiIdCreatedEvent
} from "../../domain/events/NotificationEvents.js";
import type { PaymentNotificationReadRepository } from "../../domain/repositories/PaymentNotificationReadRepository.js";
import type { CreateNotificationService } from "./CreateNotificationService.js";

export class NotificationConsumerService {
  public constructor(
    private readonly createNotificationService: CreateNotificationService,
    private readonly payments: PaymentNotificationReadRepository,
    private readonly logger: Logger
  ) {}

  public async handlePaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    const context = await this.payments.findContext(event.paymentId);
    const senderUserId = event.senderUserId ?? context?.senderUserId;
    const receiverUserId = event.receiverUserId ?? context?.receiverUserId;
    const senderName = event.senderName ?? context?.senderName;
    const receiverName = event.receiverName ?? context?.receiverName;

    if (senderUserId) {
      await this.createNotificationService.create({
        userId: senderUserId,
        notificationType: "PAYMENT_SENT",
        title: "Payment Sent",
        message: `You sent ₹${event.amount} to ${receiverName ?? "the receiver"}`,
        metadata: { paymentId: event.paymentId, paymentReference: event.paymentReference }
      });
    }

    if (receiverUserId) {
      await this.createNotificationService.create({
        userId: receiverUserId,
        notificationType: "PAYMENT_RECEIVED",
        title: "Money Received",
        message: `You received ₹${event.amount} from ${senderName ?? "the sender"}`,
        metadata: { paymentId: event.paymentId, paymentReference: event.paymentReference }
      });
    }

    this.logger.info({ eventId: event.eventId, event: "PAYMENT_COMPLETED" }, "Event Consumed");
  }

  public async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    const context = await this.payments.findContext(event.paymentId);
    const userId = event.senderUserId ?? event.userId ?? context?.senderUserId;

    if (!userId) return;

    await this.createNotificationService.create({
      userId,
      notificationType: "PAYMENT_FAILED",
      title: "Payment Failed",
      message: "Your payment could not be processed.",
      metadata: { paymentId: event.paymentId, paymentReference: event.paymentReference }
    });
    this.logger.info({ eventId: event.eventId, event: "PAYMENT_FAILED" }, "Event Consumed");
  }

  public async handleBankAccountCreated(event: BankAccountCreatedEvent): Promise<void> {
    await this.createNotificationService.create({
      userId: event.userId,
      notificationType: "ACCOUNT_CREATED",
      title: "Account Created",
      message: "Your VERO Bank account has been created successfully.",
      metadata: { accountId: event.accountId, accountNumber: event.accountNumber }
    });
    this.logger.info({ eventId: event.eventId, event: "BANK_ACCOUNT_CREATED" }, "Event Consumed");
  }

  public async handleUpiIdCreated(event: UpiIdCreatedEvent): Promise<void> {
    await this.createNotificationService.create({
      userId: event.userId,
      notificationType: "UPI_CREATED",
      title: "UPI Created",
      message: "Your VERO UPI ID is ready to use.",
      metadata: { accountId: event.accountId, upiId: event.upiId }
    });
    this.logger.info({ eventId: event.eventId, event: "UPI_ID_CREATED" }, "Event Consumed");
  }
}
