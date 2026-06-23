import type { RedisClient } from "@vero/shared-redis";

export interface OtpChallengeRecord {
  mobileNumber: string;
  otpHash: string;
  attemptsRemaining: number;
  createdAt: string;
}

export class RedisOtpChallengeStore {
  private readonly keyPrefix = "auth:otp";

  public constructor(private readonly redis: RedisClient) {}

  public async save(challengeId: string, record: OtpChallengeRecord, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(challengeId), JSON.stringify(record), "EX", ttlSeconds);
  }

  public async get(challengeId: string): Promise<OtpChallengeRecord | null> {
    const raw = await this.redis.get(this.key(challengeId));
    return raw ? (JSON.parse(raw) as OtpChallengeRecord) : null;
  }

  public async update(challengeId: string, record: OtpChallengeRecord, ttlSeconds: number): Promise<void> {
    await this.save(challengeId, record, ttlSeconds);
  }

  public async delete(challengeId: string): Promise<void> {
    await this.redis.del(this.key(challengeId));
  }

  private key(challengeId: string): string {
    return `${this.keyPrefix}:${challengeId}`;
  }
}
