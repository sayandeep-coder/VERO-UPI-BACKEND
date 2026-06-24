import { connectRabbitMq, type RabbitMqConnection } from "@vero/shared-rabbitmq";
import type { Logger } from "@vero/shared-logger";
import { NOTIFICATION_DEFAULTS } from "../../constants/notificationConstants.js";
import { SOURCE_EVENTS } from "../../domain/events/NotificationEvents.js";
import type { NotificationConsumerService } from "../../application/services/NotificationConsumerService.js";

export interface RabbitMqNotificationConsumerOptions {
  rabbitMqUrl?: string;
  paymentExchange: string;
  bankExchange: string;
  queuePrefix: string;
}

export class RabbitMqNotificationConsumer {
  private connection: Promise<RabbitMqConnection> | null = null;

  public constructor(
    private readonly options: RabbitMqNotificationConsumerOptions,
    private readonly service: NotificationConsumerService,
    private readonly logger: Logger
  ) {}

  public async start(): Promise<void> {
    if (!this.options.rabbitMqUrl) {
      this.logger.warn("RabbitMQ URL missing; notification consumers were not started");
      return;
    }

    await this.bind(this.options.paymentExchange, SOURCE_EVENTS.paymentCompleted, async (payload) => {
      await this.service.handlePaymentCompleted(payload as never);
    });
    await this.bind(this.options.paymentExchange, SOURCE_EVENTS.paymentFailed, async (payload) => {
      await this.service.handlePaymentFailed(payload as never);
    });
    await this.bind(this.options.bankExchange, SOURCE_EVENTS.bankAccountCreated, async (payload) => {
      await this.service.handleBankAccountCreated(payload as never);
    });
    await this.bind(this.options.bankExchange, SOURCE_EVENTS.upiIdCreated, async (payload) => {
      await this.service.handleUpiIdCreated(payload as never);
    });
  }

  private async bind(exchange: string, routingKey: string, handler: (payload: unknown) => Promise<void>): Promise<void> {
    const { channel } = await this.getConnection();
    await channel.assertExchange(exchange, "topic", { durable: true });
    const queue = await channel.assertQueue(`${this.options.queuePrefix}.${routingKey.toLowerCase()}`, { durable: true });
    await channel.bindQueue(queue.queue, exchange, routingKey);
    await channel.consume(queue.queue, async (message) => {
      if (!message) return;

      try {
        const payload = JSON.parse(message.content.toString()) as unknown;
        await handler(payload);
        channel.ack(message);
      } catch (error) {
        this.logger.error({ error, routingKey }, "Consumer Failures");
        channel.nack(message, false, false);
      }
    });
    this.logger.info({ exchange, queue: queue.queue, routingKey }, "Notification consumer started");
  }

  private getConnection(): Promise<RabbitMqConnection> {
    const rabbitMqUrl = this.options.rabbitMqUrl;

    if (!rabbitMqUrl) {
      throw new Error("RabbitMQ URL is required");
    }

    this.connection ??= connectRabbitMq(rabbitMqUrl);
    return this.connection;
  }
}

export const createDefaultNotificationConsumerOptions = (): Omit<RabbitMqNotificationConsumerOptions, "rabbitMqUrl"> => ({
  paymentExchange: process.env.PAYMENT_EVENTS_EXCHANGE ?? NOTIFICATION_DEFAULTS.paymentExchange,
  bankExchange: process.env.BANK_EVENTS_EXCHANGE ?? NOTIFICATION_DEFAULTS.bankExchange,
  queuePrefix: process.env.NOTIFICATION_QUEUE_PREFIX ?? NOTIFICATION_DEFAULTS.queuePrefix
});
