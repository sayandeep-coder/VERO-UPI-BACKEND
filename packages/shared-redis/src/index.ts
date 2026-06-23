import { Redis } from "ioredis";

export type RedisClient = Redis;

export const createRedisClient = (redisUrl: string): RedisClient => {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
  });
};
