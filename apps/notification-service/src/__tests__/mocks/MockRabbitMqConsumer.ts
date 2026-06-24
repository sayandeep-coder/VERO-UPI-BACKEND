export class MockRabbitMqConsumer {
  public started = false;

  public async start(): Promise<void> {
    this.started = true;
  }
}
