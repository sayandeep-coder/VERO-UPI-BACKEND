import type { RequestHandler } from "express";
import { Router } from "express";
import type { NotificationController } from "../controllers/NotificationController.js";

export const createNotificationRoutes = (
  controller: NotificationController,
  authenticate: RequestHandler
): Router => {
  const router = Router();

  router.use("/notifications", authenticate);
  router.get("/notifications", controller.getNotifications);
  router.get("/notifications/unread-count", controller.getUnreadCount);
  router.patch("/notifications/read-all", controller.markAllRead);
  router.patch("/notifications/:id/read", controller.markRead);
  router.get("/notifications/preferences", controller.getPreferences);
  router.put("/notifications/preferences", controller.updatePreferences);

  return router;
};
