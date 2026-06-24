import { connectRabbitMq, publishJson, type RabbitMqConnection } from "@vero/shared-rabbitmq";
import type { Logger } from "@vero/shared-logger";
import type { PaymentEventPublisher } from "../../domain/events/PaymentEvents.js";

export interface RabbitMqPaymentEventPublisherOptions {
  rabbitMqUrl?: string;
  exchange: string;
}

export class RabbitMqPaymentEventPublisher implements PaymentEventPublisher {
  private connection: Promise<RabbitMqConnection> | null = null;

  public constructor(
    private readonly options: RabbitMqPaymentEventPublisherOptions,
    private readonly logger: Logger
  ) {}

  public async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.options.rabbitMqUrl) {
      this.logger.warn({ routingKey }, "RabbitMQ URL missing; payment event was not published");
      return;
    }

    const { channel } = await this.getConnection();
    await channel.assertExchange(this.options.exchange, "topic", { durable: true });
    publishJson(channel, this.options.exchange, routingKey, payload, { type: routingKey });
  }

  private getConnection(): Promise<RabbitMqConnection> {
    const rabbitMqUrl = this.options.rabbitMqUrl;
    if (!rabbitMqUrl) throw new Error("RabbitMQ URL is required");
    this.connection ??= connectRabbitMq(rabbitMqUrl);
    return this.connection;
  }
}
