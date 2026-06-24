import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type {
  PaymentNotificationContext,
  PaymentNotificationReadRepository
} from "../../domain/repositories/PaymentNotificationReadRepository.js";

export class PrismaPaymentNotificationReadRepository implements PaymentNotificationReadRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async findContext(paymentId: string): Promise<PaymentNotificationContext | null> {
    try {
      const payment = await this.db.payment.findUnique({
        where: { id: paymentId },
        include: {
          senderUser: { select: { fullName: true } },
          receiverUser: { select: { fullName: true } }
        }
      });

      if (!payment) {
        return null;
      }

      return {
        paymentId: payment.id,
        senderUserId: payment.senderUserId,
        receiverUserId: payment.receiverUserId,
        senderName: payment.senderUser.fullName,
        receiverName: payment.receiverUser.fullName
      };
    } catch (error) {
      this.logger?.error({ error, paymentId }, "Repository error: find payment notification context failed");
      throw error;
    }
  }
}
