import { asyncHandler } from "@vero/shared-http";
import { parseOrThrow, z } from "@vero/shared-validation";
import type { Request, Response } from "express";
import type { LogoutService } from "../../application/services/LogoutService.js";
import type { TokenRefreshService } from "../../application/services/TokenRefreshService.js";

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(16)
});

export class AuthController {
  public constructor(
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly logoutService: LogoutService
  ) {}

  public refreshToken = asyncHandler(async (request: Request, response: Response) => {
    const body = parseOrThrow(refreshTokenSchema, request.body);
    const result = await this.tokenRefreshService.refreshAccessToken(body.refresh_token);

    response.status(200).json({ data: result });
  });

  public logout = asyncHandler(async (request: Request, response: Response) => {
    const body = parseOrThrow(refreshTokenSchema, request.body);
    await this.logoutService.logout(body.refresh_token);

    response.status(204).send();
  });
}
