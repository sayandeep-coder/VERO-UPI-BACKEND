import { Router } from "express";
import type { BankController } from "../controllers/BankController.js";

export interface BankRoutesOptions {
  authenticate: ReturnType<typeof Router>["use"];
}

export const createBankRoutes = (controller: BankController, authenticate: import("express").RequestHandler): Router => {
  const router = Router();

  router.use("/bank", authenticate);
  router.post("/bank/accounts", controller.createAccount);
  router.get("/bank/accounts", controller.getAccounts);
  router.get("/bank/accounts/balance", controller.getBalance);
  router.get("/bank/accounts/:id", controller.getAccountById);
  router.get("/bank/upi-ids", controller.getUpiIds);

  return router;
};
