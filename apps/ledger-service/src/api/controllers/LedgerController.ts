import { asyncHandler } from "@vero/shared-http";
import { ForbiddenError } from "@vero/shared-errors";
import { parseOrThrow, z } from "@vero/shared-validation";
import type { RequestHandler, Response } from "express";
import { LEDGER_ACCOUNT_TYPES, LEDGER_ENTRY_TYPES } from "../../constants/ledgerConstants.js";
import type { CreateLedgerAccountService } from "../../application/services/CreateLedgerAccountService.js";
import type { CreateLedgerTransactionService } from "../../application/services/CreateLedgerTransactionService.js";
import type { GetLedgerAccountService } from "../../application/services/GetLedgerAccountService.js";
import type { GetLedgerTransactionService } from "../../application/services/GetLedgerTransactionService.js";
import type { ReconciliationService } from "../../application/services/ReconciliationService.js";
import type { ReverseLedgerTransactionService } from "../../application/services/ReverseLedgerTransactionService.js";
import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

const createLedgerAccountSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  bank_account_id: z.string().uuid().nullable().optional(),
  account_type: z.enum(LEDGER_ACCOUNT_TYPES),
  account_name: z.string().trim().min(1).max(255)
});

const ledgerIdParamsSchema = z.object({
  id: z.string().uuid()
});

const createLedgerTransactionSchema = z.object({
  reference_type: z.string().trim().min(1).max(50),
  reference_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  entries: z.array(
    z.object({
      ledger_account_id: z.string().uuid(),
      entry_type: z.enum(LEDGER_ENTRY_TYPES),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
      description: z.string().trim().max(2000).nullable().optional()
    })
  )
});

export class LedgerController {
  public constructor(
    private readonly createLedgerAccountService: CreateLedgerAccountService,
    private readonly getLedgerAccountService: GetLedgerAccountService,
    private readonly createLedgerTransactionService: CreateLedgerTransactionService,
    private readonly getLedgerTransactionService: GetLedgerTransactionService,
    private readonly reverseLedgerTransactionService: ReverseLedgerTransactionService,
    private readonly reconciliationService: ReconciliationService
  ) {}

  public createLedgerAccount: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const body = parseOrThrow(createLedgerAccountSchema, request.body);
    const userId = body.user_id === undefined ? authenticated.principal.userId : body.user_id;

    if (userId && userId !== authenticated.principal.userId) {
      throw new ForbiddenError("Ledger account cannot be created for another user");
    }

    const result = await this.createLedgerAccountService.create({
      userId,
      bankAccountId: body.bank_account_id ?? null,
      accountType: body.account_type,
      accountName: body.account_name
    });

    response.status(201).json({ data: result });
  });

  public getLedgerAccount: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(ledgerIdParamsSchema, request.params);
    const result = await this.getLedgerAccountService.get({
      accountId: params.id,
      userId: authenticated.principal.userId
    });

    response.status(200).json({ data: result });
  });

  public createLedgerTransaction: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const body = parseOrThrow(createLedgerTransactionSchema, request.body);
    const result = await this.createLedgerTransactionService.create({
      userId: authenticated.principal.userId,
      referenceType: body.reference_type,
      referenceId: body.reference_id ?? null,
      description: body.description ?? null,
      entries: body.entries.map((entry) => ({
        ledgerAccountId: entry.ledger_account_id,
        entryType: entry.entry_type,
        amount: entry.amount,
        description: entry.description ?? null
      }))
    });

    response.status(201).json({ data: result });
  });

  public getLedgerTransaction: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(ledgerIdParamsSchema, request.params);
    const result = await this.getLedgerTransactionService.get({
      transactionId: params.id,
      userId: authenticated.principal.userId
    });

    response.status(200).json({ data: result });
  });

  public reverseLedgerTransaction: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(ledgerIdParamsSchema, request.params);
    const result = await this.reverseLedgerTransactionService.reverse(params.id, authenticated.principal.userId);

    response.status(201).json({ data: result });
  });

  public reconcile: RequestHandler = asyncHandler(async (_request, response: Response) => {
    const result = await this.reconciliationService.run();

    response.status(200).json({ data: result });
  });
}
