import type {
  BankAccountCreatedEvent,
  BankEventPublisher,
  UpiIdCreatedEvent
} from "../../domain/events/BankEvents.js";

export class MockBankEventPublisher implements BankEventPublisher {
  public readonly bankAccountCreatedEvents: BankAccountCreatedEvent[] = [];
  public readonly upiIdCreatedEvents: UpiIdCreatedEvent[] = [];

  public async publishBankAccountCreated(event: BankAccountCreatedEvent): Promise<void> {
    this.bankAccountCreatedEvents.push(event);
  }

  public async publishUpiIdCreated(event: UpiIdCreatedEvent): Promise<void> {
    this.upiIdCreatedEvents.push(event);
  }
}
