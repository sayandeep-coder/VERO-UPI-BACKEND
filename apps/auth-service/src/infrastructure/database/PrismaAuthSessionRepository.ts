import { prisma, UserSessionRepository } from "@vero/shared-database";
import type { UserSession } from "@vero/shared-types";
import type { AuthSessionRepository } from "../../domain/repositories/AuthSessionRepository.js";

export class PrismaAuthSessionRepository implements AuthSessionRepository {
  private readonly sessions = new UserSessionRepository(prisma);

  public async findActiveByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.sessions.findActiveByRefreshToken(refreshToken);
  }

  public async revoke(sessionId: string): Promise<UserSession> {
    return this.sessions.revoke(sessionId);
  }
}
