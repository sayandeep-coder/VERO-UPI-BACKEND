import { connectRabbitMq, publishJson, type RabbitMqConnection } from "@vero/shared-rabbitmq";
import type { Logger } from "@vero/shared-logger";
import {
  BANK_EVENTS,
  type BankAccountCreatedEvent,
  type BankEventPublisher,
  type UpiIdCreatedEvent
} from "../../domain/events/BankEvents.js";

export interface RabbitMqBankEventPublisherOptions {
  rabbitMqUrl?: string;
  exchange: string;
}

export class RabbitMqBankEventPublisher implements BankEventPublisher {
  private connection: Promise<RabbitMqConnection> | null = null;

  public constructor(
    private readonly options: RabbitMqBankEventPublisherOptions,
    private readonly logger: Logger
  ) {}

  public async publishBankAccountCreated(event: BankAccountCreatedEvent): Promise<void> {
    await this.publish(BANK_EVENTS.bankAccountCreated, event);
  }

  public async publishUpiIdCreated(event: UpiIdCreatedEvent): Promise<void> {
    await this.publish(BANK_EVENTS.upiIdCreated, event);
  }

  private async publish(routingKey: string, event: unknown): Promise<void> {
    if (!this.options.rabbitMqUrl) {
      this.logger.warn({ routingKey }, "RabbitMQ URL missing; bank event was not published");
      return;
    }

    const { channel } = await this.getConnection();
    await channel.assertExchange(this.options.exchange, "topic", { durable: true });
    publishJson(channel, this.options.exchange, routingKey, event, { type: routingKey });
  }

  private getConnection(): Promise<RabbitMqConnection> {
    this.connection ??= connectRabbitMq(this.options.rabbitMqUrl as string);
    return this.connection;
  }
}
