import type { LedgerEventPublisher } from "../../domain/events/LedgerEvents.js";

export class MockLedgerEventPublisher implements LedgerEventPublisher {
  public readonly events: Array<{ routingKey: string; payload: unknown }> = [];

  public async publish(routingKey: string, payload: unknown): Promise<void> {
    this.events.push({ routingKey, payload });
  }
}
