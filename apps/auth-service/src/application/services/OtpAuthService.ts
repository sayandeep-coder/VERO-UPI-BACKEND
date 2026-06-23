import { signAccessToken } from "@vero/shared-auth";
import { UnauthorizedError, ValidationError } from "@vero/shared-errors";
import { randomBytes, randomInt, randomUUID, createHash } from "node:crypto";
import type { SendOtpResponseDto, VerifyOtpResponseDto } from "../dto/AuthDtos.js";
import type { AuthDeviceRepository } from "../../domain/repositories/AuthDeviceRepository.js";
import type { AuthSessionRepository } from "../../domain/repositories/AuthSessionRepository.js";
import type { AuthUserRepository } from "../../domain/repositories/AuthUserRepository.js";
import type { RedisOtpChallengeStore } from "../../infrastructure/cache/RedisOtpChallengeStore.js";
import type { UpsertAuthDeviceInput } from "../../domain/repositories/AuthDeviceRepository.js";
import type { CreateAuthSessionInput } from "../../domain/repositories/AuthSessionRepository.js";

export interface SendOtpCommand {
  mobileNumber: string;
}

export interface VerifyOtpCommand {
  challengeId: string;
  otp: string;
  fullName?: string | null;
  deviceId?: string | null;
  deviceName?: string | null;
  deviceModel?: string | null;
  operatingSystem?: string | null;
  appVersion?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface OtpAuthServiceOptions {
  otpTtlSeconds: number;
  resendAfterSeconds: number;
  maxAttempts: number;
  exposeOtpInResponse: boolean;
}

export class OtpAuthService {
  public constructor(
    private readonly users: AuthUserRepository,
    private readonly devices: AuthDeviceRepository,
    private readonly sessions: AuthSessionRepository,
    private readonly otpStore: RedisOtpChallengeStore,
    private readonly jwtAccessSecret: string,
    private readonly options: OtpAuthServiceOptions
  ) {}

  public async sendOtp(command: SendOtpCommand): Promise<SendOtpResponseDto> {
    const challengeId = randomUUID();
    const otp = this.generateOtp();

    await this.otpStore.save(
      challengeId,
      {
        mobileNumber: command.mobileNumber,
        otpHash: this.hashOtp(challengeId, otp),
        attemptsRemaining: this.options.maxAttempts,
        createdAt: new Date().toISOString()
      },
      this.options.otpTtlSeconds
    );

    const response: SendOtpResponseDto = {
      challenge_id: challengeId,
      expires_in_seconds: this.options.otpTtlSeconds,
      resend_after_seconds: this.options.resendAfterSeconds
    };

    if (this.options.exposeOtpInResponse) {
      response.dev_otp = otp;
    }

    return response;
  }

  public async verifyOtp(command: VerifyOtpCommand): Promise<VerifyOtpResponseDto> {
    const challenge = await this.otpStore.get(command.challengeId);

    if (!challenge) {
      throw new UnauthorizedError("OTP is expired or invalid");
    }

    if (challenge.attemptsRemaining <= 0) {
      await this.otpStore.delete(command.challengeId);
      throw new UnauthorizedError("OTP attempt limit exceeded");
    }

    if (challenge.otpHash !== this.hashOtp(command.challengeId, command.otp)) {
      await this.otpStore.update(
        command.challengeId,
        {
          ...challenge,
          attemptsRemaining: challenge.attemptsRemaining - 1
        },
        this.options.otpTtlSeconds
      );
      throw new UnauthorizedError("OTP is invalid");
    }

    let user = await this.users.findByMobileNumber(challenge.mobileNumber);
    const isNewUser = !user;

    if (!user) {
      if (!command.fullName || command.fullName.trim().length < 2) {
        throw new ValidationError("Full name is required for first-time registration");
      }

      user = await this.users.create({
        mobileNumber: challenge.mobileNumber,
        fullName: command.fullName.trim()
      });
    }

    await this.users.touchLastLogin(user.id);

    if (command.deviceId) {
      const deviceInput: UpsertAuthDeviceInput = {
        userId: user.id,
        deviceId: command.deviceId
      };

      if (command.deviceName) deviceInput.deviceName = command.deviceName;
      if (command.deviceModel) deviceInput.deviceModel = command.deviceModel;
      if (command.operatingSystem) deviceInput.operatingSystem = command.operatingSystem;
      if (command.appVersion) deviceInput.appVersion = command.appVersion;

      await this.devices.upsert(deviceInput);
    }

    const refreshToken = this.generateRefreshToken();
    const sessionInput: CreateAuthSessionInput = {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    if (command.deviceId) sessionInput.deviceId = command.deviceId;
    if (command.ipAddress) sessionInput.ipAddress = command.ipAddress;
    if (command.userAgent) sessionInput.userAgent = command.userAgent;

    const session = await this.sessions.create(sessionInput);

    const expiresInSeconds = 900;
    const accessToken = signAccessToken(
      {
        userId: user.id,
        sessionId: session.id,
        roles: ["USER"]
      },
      this.jwtAccessSecret,
      expiresInSeconds
    );

    await this.otpStore.delete(command.challengeId);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in_seconds: expiresInSeconds,
      is_new_user: isNewUser,
      user: {
        id: user.id,
        mobile_number: user.mobileNumber,
        full_name: user.fullName,
        status: user.status,
        is_verified: user.isVerified
      }
    };
  }

  private generateOtp(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, "0");
  }

  private generateRefreshToken(): string {
    return randomBytes(48).toString("base64url");
  }

  private hashOtp(challengeId: string, otp: string): string {
    return createHash("sha256").update(`${challengeId}:${otp}:${this.jwtAccessSecret}`).digest("hex");
  }
}
