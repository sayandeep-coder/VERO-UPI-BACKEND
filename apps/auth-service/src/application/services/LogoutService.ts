import { UnauthorizedError } from "@vero/shared-errors";
import type { AuthSessionRepository } from "../../domain/repositories/AuthSessionRepository.js";

export class LogoutService {
  public constructor(private readonly sessions: AuthSessionRepository) {}

  public async logout(refreshToken: string): Promise<void> {
    const session = await this.sessions.findActiveByRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }

    await this.sessions.revoke(session.id);
  }
}
