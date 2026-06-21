import amqp, { type Channel, type Connection, type Options } from "amqplib";

export interface RabbitMqConnection {
  connection: Connection;
  channel: Channel;
}

export const connectRabbitMq = async (url: string): Promise<RabbitMqConnection> => {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  return { connection, channel };
};

export const publishJson = (
  channel: Channel,
  exchange: string,
  routingKey: string,
  payload: unknown,
  options: Options.Publish = {}
): boolean => {
  return channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
    contentType: "application/json",
    persistent: true,
    ...options
  });
};
