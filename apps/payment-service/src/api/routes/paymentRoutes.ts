import type { RequestHandler } from "express";
import { Router } from "express";
import type { PaymentController } from "../controllers/PaymentController.js";

export const createPaymentRoutes = (controller: PaymentController, authenticate: RequestHandler): Router => {
  const router = Router();

  router.use("/payments", authenticate);
  router.post("/payments/send", controller.sendMoney);
  router.get("/payments/history", controller.getHistory);
  router.get("/payments/transactions", controller.getTransactions);
  router.get("/payments/transactions/:id", controller.getTransaction);
  router.get("/payments/:id", controller.getPayment);

  return router;
};
