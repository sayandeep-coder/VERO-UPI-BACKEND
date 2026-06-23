import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();

  router.post("/auth/otp/send", controller.sendOtp);
  router.post("/auth/otp/verify", controller.verifyOtp);
  router.post("/auth/token/refresh", controller.refreshToken);
  router.post("/auth/logout", controller.logout);

  return router;
};
