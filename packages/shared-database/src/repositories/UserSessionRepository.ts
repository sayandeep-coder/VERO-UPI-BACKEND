import type { UserSession } from "@vero/shared-types";
import { toUserSession } from "../mappers/userMapper.js";
import type { DatabaseClient } from "../prisma/client.js";

export interface CreateUserSessionInput {
  userId: string;
  refreshToken: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export class UserSessionRepository {
  public constructor(private readonly db: DatabaseClient) {}

  public async create(input: CreateUserSessionInput): Promise<UserSession> {
    const session = await this.db.userSession.create({
      data: input
    });

    return toUserSession(session);
  }

  public async findActiveByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    const session = await this.db.userSession.findFirst({
      where: {
        refreshToken,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return session ? toUserSession(session) : null;
  }

  public async revoke(sessionId: string, revokedAt = new Date()): Promise<UserSession> {
    const session = await this.db.userSession.update({
      where: { id: sessionId },
      data: { revokedAt }
    });

    return toUserSession(session);
  }

  public async revokeAllForUser(userId: string, revokedAt = new Date()): Promise<number> {
    const result = await this.db.userSession.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: { revokedAt }
    });

    return result.count;
  }
}
