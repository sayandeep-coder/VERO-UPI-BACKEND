import { asyncHandler } from "@vero/shared-http";
import { mobileNumberSchema, parseOrThrow, z } from "@vero/shared-validation";
import type { Request, RequestHandler, Response } from "express";
import type { LogoutService } from "../../application/services/LogoutService.js";
import type { OtpAuthService, VerifyOtpCommand } from "../../application/services/OtpAuthService.js";
import type { TokenRefreshService } from "../../application/services/TokenRefreshService.js";

const sendOtpSchema = z.object({
  mobile_number: mobileNumberSchema
});

const verifyOtpSchema = z.object({
  challenge_id: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/),
  full_name: z.string().trim().min(2).max(255).optional(),
  device_id: z.string().trim().min(1).max(255).optional(),
  device_name: z.string().trim().max(255).optional(),
  device_model: z.string().trim().max(255).optional(),
  operating_system: z.string().trim().max(50).optional(),
  app_version: z.string().trim().max(50).optional()
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(16)
});

export class AuthController {
  public constructor(
    private readonly otpAuthService: OtpAuthService,
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly logoutService: LogoutService
  ) {}

  public sendOtp: RequestHandler = asyncHandler(async (request: Request, response: Response) => {
    const body = parseOrThrow(sendOtpSchema, request.body);
    const result = await this.otpAuthService.sendOtp({ mobileNumber: body.mobile_number });

    response.status(200).json({ data: result });
  });

  public verifyOtp: RequestHandler = asyncHandler(async (request: Request, response: Response) => {
    const body = parseOrThrow(verifyOtpSchema, request.body);
    const command: VerifyOtpCommand = {
      challengeId: body.challenge_id,
      otp: body.otp
    };

    const userAgent = request.header("user-agent");

    if (request.ip) command.ipAddress = request.ip;
    if (body.full_name) command.fullName = body.full_name;
    if (body.device_id) command.deviceId = body.device_id;
    if (body.device_name) command.deviceName = body.device_name;
    if (body.device_model) command.deviceModel = body.device_model;
    if (body.operating_system) command.operatingSystem = body.operating_system;
    if (body.app_version) command.appVersion = body.app_version;
    if (userAgent) command.userAgent = userAgent;

    const result = await this.otpAuthService.verifyOtp(command);

    response.status(200).json({ data: result });
  });

  public refreshToken: RequestHandler = asyncHandler(async (request: Request, response: Response) => {
    const body = parseOrThrow(refreshTokenSchema, request.body);
    const result = await this.tokenRefreshService.refreshAccessToken(body.refresh_token);

    response.status(200).json({ data: result });
  });

  public logout: RequestHandler = asyncHandler(async (request: Request, response: Response) => {
    const body = parseOrThrow(refreshTokenSchema, request.body);
    await this.logoutService.logout(body.refresh_token);

    response.status(204).send();
  });
}
