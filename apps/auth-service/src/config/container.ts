import { getRequiredEnv } from "@vero/shared-config";
import { createRedisClient } from "@vero/shared-redis";
import { AuthController } from "../api/controllers/AuthController.js";
import { createAuthRoutes } from "../api/routes/authRoutes.js";
import { LogoutService } from "../application/services/LogoutService.js";
import { OtpAuthService } from "../application/services/OtpAuthService.js";
import { TokenRefreshService } from "../application/services/TokenRefreshService.js";
import { RedisOtpChallengeStore } from "../infrastructure/cache/RedisOtpChallengeStore.js";
import { PrismaAuthDeviceRepository } from "../infrastructure/database/PrismaAuthDeviceRepository.js";
import { PrismaAuthSessionRepository } from "../infrastructure/database/PrismaAuthSessionRepository.js";
import { PrismaAuthUserRepository } from "../infrastructure/database/PrismaAuthUserRepository.js";

export const createAuthServiceContainer = () => {
  const userRepository = new PrismaAuthUserRepository();
  const deviceRepository = new PrismaAuthDeviceRepository();
  const sessionRepository = new PrismaAuthSessionRepository();
  const jwtAccessSecret = getRequiredEnv("JWT_ACCESS_SECRET");
  const redis = createRedisClient(getRequiredEnv("REDIS_URL"));
  const otpStore = new RedisOtpChallengeStore(redis);
  const otpAuthService = new OtpAuthService(userRepository, deviceRepository, sessionRepository, otpStore, jwtAccessSecret, {
    otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 300),
    resendAfterSeconds: Number(process.env.OTP_RESEND_AFTER_SECONDS ?? 30),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
    exposeOtpInResponse: process.env.NODE_ENV !== "production"
  });
  const tokenRefreshService = new TokenRefreshService(sessionRepository, jwtAccessSecret);
  const logoutService = new LogoutService(sessionRepository);
  const authController = new AuthController(otpAuthService, tokenRefreshService, logoutService);
  const router = createAuthRoutes(authController);

  return { router };
};
