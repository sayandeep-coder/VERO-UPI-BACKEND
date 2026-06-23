import { prisma, UserSessionRepository } from "@vero/shared-database";
import type { UserSession } from "@vero/shared-types";
import type { AuthSessionRepository, CreateAuthSessionInput } from "../../domain/repositories/AuthSessionRepository.js";

export class PrismaAuthSessionRepository implements AuthSessionRepository {
  private readonly sessions = new UserSessionRepository(prisma);

  public async create(input: CreateAuthSessionInput): Promise<UserSession> {
    return this.sessions.create(input);
  }

  public async findActiveByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.sessions.findActiveByRefreshToken(refreshToken);
  }

  public async revoke(sessionId: string): Promise<UserSession> {
    return this.sessions.revoke(sessionId);
  }
}
