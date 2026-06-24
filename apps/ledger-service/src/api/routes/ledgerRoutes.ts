import type { RequestHandler } from "express";
import { Router } from "express";
import type { LedgerController } from "../controllers/LedgerController.js";

export const createLedgerRoutes = (controller: LedgerController, authenticate: RequestHandler): Router => {
  const router = Router();

  router.use("/ledger", authenticate);
  router.post("/ledger/accounts", controller.createLedgerAccount);
  router.get("/ledger/accounts/:id", controller.getLedgerAccount);
  router.post("/ledger/transactions", controller.createLedgerTransaction);
  router.get("/ledger/transactions/:id", controller.getLedgerTransaction);
  router.post("/ledger/transactions/:id/reverse", controller.reverseLedgerTransaction);
  router.post("/ledger/reconciliation", controller.reconcile);

  return router;
};
