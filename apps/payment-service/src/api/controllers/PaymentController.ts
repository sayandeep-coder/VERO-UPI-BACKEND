import { asyncHandler } from "@vero/shared-http";
import { parseOrThrow, z } from "@vero/shared-validation";
import type { RequestHandler, Response } from "express";
import type { GetPaymentHistoryService } from "../../application/services/GetPaymentHistoryService.js";
import type { GetPaymentService } from "../../application/services/GetPaymentService.js";
import type { GetTransactionDetailsService } from "../../application/services/GetTransactionDetailsService.js";
import type { GetUserTransactionsService } from "../../application/services/GetUserTransactionsService.js";
import type { SendMoneyService } from "../../application/services/SendMoneyService.js";
import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

const sendMoneySchema = z.object({
  receiverUpiId: z.string().trim().min(3).max(255),
  amount: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/)]),
  remarks: z.string().trim().max(255).optional()
});

const idParamsSchema = z.object({
  id: z.string().uuid()
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export class PaymentController {
  public constructor(
    private readonly sendMoneyService: SendMoneyService,
    private readonly getPaymentService: GetPaymentService,
    private readonly getPaymentHistoryService: GetPaymentHistoryService,
    private readonly getUserTransactionsService: GetUserTransactionsService,
    private readonly getTransactionDetailsService: GetTransactionDetailsService
  ) {}

  public sendMoney: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const body = parseOrThrow(sendMoneySchema, request.body);
    const command = {
      senderUserId: authenticated.principal.userId,
      receiverUpiId: body.receiverUpiId,
      amount: String(body.amount),
      remarks: body.remarks ?? null
    };
    const authorizationHeader = request.header("authorization");

    if (authorizationHeader) {
      Object.assign(command, { authorizationHeader });
    }

    const result = await this.sendMoneyService.send(command);

    response.status(201).json({ data: result });
  });

  public getHistory: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const query = parseOrThrow(paginationSchema, request.query);
    const result = await this.getPaymentHistoryService.list({
      userId: authenticated.principal.userId,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0
    });
    response.status(200).json({ data: result });
  });

  public getPayment: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(idParamsSchema, request.params);
    const result = await this.getPaymentService.get({
      userId: authenticated.principal.userId,
      paymentId: params.id
    });
    response.status(200).json({ data: result });
  });

  public getTransactions: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const query = parseOrThrow(paginationSchema, request.query);
    const result = await this.getUserTransactionsService.list({
      userId: authenticated.principal.userId,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0
    });
    response.status(200).json({ data: result });
  });

  public getTransaction: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(idParamsSchema, request.params);
    const result = await this.getTransactionDetailsService.get({
      userId: authenticated.principal.userId,
      transactionId: params.id
    });
    response.status(200).json({ data: result });
  });
}
