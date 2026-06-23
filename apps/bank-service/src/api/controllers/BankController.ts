import { asyncHandler } from "@vero/shared-http";
import { parseOrThrow, z } from "@vero/shared-validation";
import type { RequestHandler, Response } from "express";
import type { CreateBankAccountService } from "../../application/services/CreateBankAccountService.js";
import type { GetBalanceService } from "../../application/services/GetBalanceService.js";
import type { GetBankAccountService } from "../../application/services/GetBankAccountService.js";
import type { GetUpiIdsService } from "../../application/services/GetUpiIdsService.js";
import type { GetUserAccountsService } from "../../application/services/GetUserAccountsService.js";
import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

const accountParamsSchema = z.object({
  id: z.string().uuid()
});

export class BankController {
  public constructor(
    private readonly createBankAccountService: CreateBankAccountService,
    private readonly getBankAccountService: GetBankAccountService,
    private readonly getUserAccountsService: GetUserAccountsService,
    private readonly getBalanceService: GetBalanceService,
    private readonly getUpiIdsService: GetUpiIdsService
  ) {}

  public createAccount: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.createBankAccountService.create({ userId: authenticated.principal.userId });

    response.status(201).json({ data: result });
  });

  public getAccounts: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.getUserAccountsService.list({ userId: authenticated.principal.userId });

    response.status(200).json({ data: result });
  });

  public getAccountById: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(accountParamsSchema, request.params);
    const result = await this.getBankAccountService.get({
      userId: authenticated.principal.userId,
      accountId: params.id
    });

    response.status(200).json({ data: result });
  });

  public getBalance: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.getBalanceService.get({ userId: authenticated.principal.userId });

    response.status(200).json({ data: result });
  });

  public getUpiIds: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.getUpiIdsService.list({ userId: authenticated.principal.userId });

    response.status(200).json({ data: result });
  });
}
