import { getRequiredEnv } from "@vero/shared-config";
import { AuthController } from "../api/controllers/AuthController.js";
import { createAuthRoutes } from "../api/routes/authRoutes.js";
import { LogoutService } from "../application/services/LogoutService.js";
import { TokenRefreshService } from "../application/services/TokenRefreshService.js";
import { PrismaAuthSessionRepository } from "../infrastructure/database/PrismaAuthSessionRepository.js";

export const createAuthServiceContainer = () => {
  const sessionRepository = new PrismaAuthSessionRepository();
  const tokenRefreshService = new TokenRefreshService(sessionRepository, getRequiredEnv("JWT_ACCESS_SECRET"));
  const logoutService = new LogoutService(sessionRepository);
  const authController = new AuthController(tokenRefreshService, logoutService);
  const router = createAuthRoutes(authController);

  return { router };
};
