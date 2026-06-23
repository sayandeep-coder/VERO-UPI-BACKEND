import type { UserSession } from "@vero/shared-types";

export interface CreateAuthSessionInput {
  userId: string;
  refreshToken: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export interface AuthSessionRepository {
  create(input: CreateAuthSessionInput): Promise<UserSession>;
  findActiveByRefreshToken(refreshToken: string): Promise<UserSession | null>;
  revoke(sessionId: string): Promise<UserSession>;
}
