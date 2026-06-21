import type { UserSession } from "@vero/shared-types";

export interface AuthSessionRepository {
  findActiveByRefreshToken(refreshToken: string): Promise<UserSession | null>;
  revoke(sessionId: string): Promise<UserSession>;
}
