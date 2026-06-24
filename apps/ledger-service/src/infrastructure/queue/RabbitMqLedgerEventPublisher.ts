import { connectRabbitMq, publishJson, type RabbitMqConnection } from "@vero/shared-rabbitmq";
import type { Logger } from "@vero/shared-logger";
import type { LedgerEventPublisher } from "../../domain/events/LedgerEvents.js";

export interface RabbitMqLedgerEventPublisherOptions {
  rabbitMqUrl?: string;
  exchange: string;
}

export class RabbitMqLedgerEventPublisher implements LedgerEventPublisher {
  private connection: Promise<RabbitMqConnection> | null = null;

  public constructor(
    private readonly options: RabbitMqLedgerEventPublisherOptions,
    private readonly logger: Logger
  ) {}

  public async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.options.rabbitMqUrl) {
      this.logger.warn({ routingKey }, "RabbitMQ URL missing; ledger event was not published");
      return;
    }

    const { channel } = await this.getConnection();
    await channel.assertExchange(this.options.exchange, "topic", { durable: true });
    publishJson(channel, this.options.exchange, routingKey, payload, { type: routingKey });
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
