import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();

  router.post("/auth/token/refresh", controller.refreshToken);
  router.post("/auth/logout", controller.logout);

  return router;
};
