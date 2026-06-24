import { connectRabbitMq, type RabbitMqConnection } from "@vero/shared-rabbitmq";
import type { Logger } from "@vero/shared-logger";
import { LEDGER_DEFAULTS } from "../../constants/ledgerConstants.js";
import { LEDGER_EVENTS, type BankAccountCreatedEvent } from "../../domain/events/LedgerEvents.js";
import type { CreateLedgerAccountService } from "../../application/services/CreateLedgerAccountService.js";

export interface BankAccountCreatedConsumerOptions {
  rabbitMqUrl?: string;
  exchange: string;
  queue: string;
}

export class BankAccountCreatedConsumer {
  private connection: Promise<RabbitMqConnection> | null = null;

  public constructor(
    private readonly options: BankAccountCreatedConsumerOptions,
    private readonly createLedgerAccountService: CreateLedgerAccountService,
    private readonly logger: Logger
  ) {}

  public async start(): Promise<void> {
    if (!this.options.rabbitMqUrl) {
      this.logger.warn("RabbitMQ URL missing; bank account created consumer was not started");
      return;
    }

    const { channel } = await this.getConnection();
    await channel.assertExchange(this.options.exchange, "topic", { durable: true });
    const queue = await channel.assertQueue(this.options.queue, { durable: true });
    await channel.bindQueue(queue.queue, this.options.exchange, LEDGER_EVENTS.bankAccountCreated);

    await channel.consume(queue.queue, async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload = JSON.parse(message.content.toString()) as BankAccountCreatedEvent;
        await this.createLedgerAccountService.createForBankAccount(payload.userId, payload.accountId, payload.accountNumber);
        channel.ack(message);
      } catch (error) {
        this.logger.error({ error }, "Failed to consume BANK_ACCOUNT_CREATED");
        channel.nack(message, false, true);
      }
    });

    this.logger.info(
      { exchange: this.options.exchange, queue: this.options.queue, routingKey: LEDGER_EVENTS.bankAccountCreated },
      "Ledger bank account consumer started"
    );
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
