import type { PaymentEventPublisher } from "../../domain/events/PaymentEvents.js";

export class MockPaymentEventPublisher implements PaymentEventPublisher {
  public readonly events: Array<{ routingKey: string; payload: unknown }> = [];

  public async publish(routingKey: string, payload: unknown): Promise<void> {
    this.events.push({ routingKey, payload });
  }
}
