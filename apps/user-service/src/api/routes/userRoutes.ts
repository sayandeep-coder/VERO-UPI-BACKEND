import { Router } from "express";
import type { UserController } from "../controllers/UserController.js";

export const createUserRoutes = (controller: UserController): Router => {
  const router = Router();

  router.get("/users/:userId", controller.getById);

  return router;
};
