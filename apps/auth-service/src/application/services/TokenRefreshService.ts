import { signAccessToken } from "@vero/shared-auth";
import { UnauthorizedError } from "@vero/shared-errors";
import type { RefreshTokenResponseDto } from "../dto/AuthDtos.js";
import type { AuthSessionRepository } from "../../domain/repositories/AuthSessionRepository.js";

export class TokenRefreshService {
  public constructor(
    private readonly sessions: AuthSessionRepository,
    private readonly jwtAccessSecret: string
  ) {}

  public async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const session = await this.sessions.findActiveByRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }

    const expiresInSeconds = 900;
    const accessToken = signAccessToken(
      {
        userId: session.userId,
        sessionId: session.id,
        roles: ["USER"]
      },
      this.jwtAccessSecret,
      expiresInSeconds
    );

    return {
      access_token: accessToken,
      expires_in_seconds: expiresInSeconds
    };
  }
}
