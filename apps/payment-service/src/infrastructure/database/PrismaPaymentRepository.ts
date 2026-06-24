import { Prisma } from "@prisma/client";
import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import { PAYMENT_DEFAULTS } from "../../constants/paymentConstants.js";
import { DuplicatePaymentReferenceError } from "../../domain/errors/PaymentDomainErrors.js";
import type { Payment } from "../../domain/entities/Payment.js";
import type {
  CompletePaymentInput,
  CreatePaymentInput,
  PaymentHistoryQuery,
  PaymentRepository
} from "../../domain/repositories/PaymentRepository.js";
import { toPayment } from "./paymentMappers.js";

export class PrismaPaymentRepository implements PaymentRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findLatestPaymentReference(): Promise<string | null> {
    try {
      const payment = await this.db.payment.findFirst({
        orderBy: { paymentReference: "desc" },
        select: { paymentReference: true }
      });
      return payment?.paymentReference ?? null;
    } catch (error) {
      this.logger?.error({ error }, "Repository error: find latest payment reference failed");
      throw error;
    }
  }

  public async create(input: CreatePaymentInput): Promise<Payment> {
    try {
      const payment = await this.db.payment.create({
        data: input
      });
      return toPayment(payment);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicatePaymentReferenceError(input.paymentReference);
      }
      this.logger?.error({ error, senderUserId: input.senderUserId }, "Repository error: create payment failed");
      throw error;
    }
  }

  public async findById(paymentId: string): Promise<Payment | null> {
    try {
      const payment = await this.db.payment.findUnique({ where: { id: paymentId } });
      return payment ? toPayment(payment) : null;
    } catch (error) {
      this.logger?.error({ error, paymentId }, "Repository error: find payment failed");
      throw error;
    }
  }

  public async findByUser(paymentId: string, userId: string): Promise<Payment | null> {
    try {
      const payment = await this.db.payment.findFirst({
        where: {
          id: paymentId,
          OR: [{ senderUserId: userId }, { receiverUserId: userId }]
        }
      });
      return payment ? toPayment(payment) : null;
    } catch (error) {
      this.logger?.error({ error, paymentId, userId }, "Repository error: find owned payment failed");
      throw error;
    }
  }

  public async findHistory(query: PaymentHistoryQuery): Promise<Payment[]> {
    try {
      const payments = await this.db.payment.findMany({
        where: {
          OR: [{ senderUserId: query.userId }, { receiverUserId: query.userId }]
        },
        orderBy: { initiatedAt: "desc" },
        take: query.limit,
        skip: query.offset
      });
      return payments.map(toPayment);
    } catch (error) {
      this.logger?.error({ error, userId: query.userId }, "Repository error: find payment history failed");
      throw error;
    }
  }

  public async updateStatus(paymentId: string, status: Payment["status"]): Promise<Payment> {
    try {
      const payment = await this.db.payment.update({
        where: { id: paymentId },
        data: { status }
      });
      return toPayment(payment);
    } catch (error) {
      this.logger?.error({ error, paymentId, status }, "Repository error: update payment status failed");
      throw error;
    }
  }

  public async complete(paymentId: string, input: CompletePaymentInput): Promise<Payment> {
    try {
      const payment = await this.db.payment.update({
        where: { id: paymentId },
        data: {
          status: PAYMENT_DEFAULTS.statusCompleted,
          ledgerTransactionId: input.ledgerTransactionId,
          completedAt: input.completedAt
        }
      });
      return toPayment(payment);
    } catch (error) {
      this.logger?.error({ error, paymentId }, "Repository error: complete payment failed");
      throw error;
    }
  }

  public async fail(paymentId: string, failedAt: Date): Promise<Payment> {
    try {
      const payment = await this.db.payment.update({
        where: { id: paymentId },
        data: {
          status: PAYMENT_DEFAULTS.statusFailed,
          failedAt
        }
      });
      return toPayment(payment);
    } catch (error) {
      this.logger?.error({ error, paymentId }, "Repository error: fail payment failed");
      throw error;
    }
  }
}
