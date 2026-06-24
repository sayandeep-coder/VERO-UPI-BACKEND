import type { Logger } from "@vero/shared-logger";
import { PaymentController } from "../api/controllers/PaymentController.js";
import { authenticateRequest } from "../api/middlewares/authenticateRequest.js";
import { createPaymentRoutes } from "../api/routes/paymentRoutes.js";
import { GetPaymentHistoryService } from "../application/services/GetPaymentHistoryService.js";
import { GetPaymentService } from "../application/services/GetPaymentService.js";
import { GetTransactionDetailsService } from "../application/services/GetTransactionDetailsService.js";
import { GetUserTransactionsService } from "../application/services/GetUserTransactionsService.js";
import { PaymentReferenceGeneratorService } from "../application/services/PaymentReferenceGeneratorService.js";
import { PaymentValidationService } from "../application/services/PaymentValidationService.js";
import { SendMoneyService } from "../application/services/SendMoneyService.js";
import { PrismaPaymentRepository } from "../infrastructure/database/PrismaPaymentRepository.js";
import {
  PrismaPaymentBankAccountReadRepository,
  PrismaPaymentLedgerAccountReadRepository,
  PrismaPaymentUpiIdReadRepository,
  PrismaPaymentUserReadRepository
} from "../infrastructure/database/PrismaPaymentReadRepositories.js";
import { PrismaTransactionRepository } from "../infrastructure/database/PrismaTransactionRepository.js";
import { HttpLedgerServiceClient } from "../infrastructure/external/HttpLedgerServiceClient.js";
import { RabbitMqPaymentEventPublisher } from "../infrastructure/queue/RabbitMqPaymentEventPublisher.js";

export interface PaymentServiceContainerOptions {
  jwtAccessSecret: string;
  logger: Logger;
}

export const createPaymentServiceContainer = ({ jwtAccessSecret, logger }: PaymentServiceContainerOptions) => {
  const paymentRepository = new PrismaPaymentRepository(undefined, logger);
  const transactionRepository = new PrismaTransactionRepository(undefined, logger);
  const userRepository = new PrismaPaymentUserReadRepository();
  const bankAccountRepository = new PrismaPaymentBankAccountReadRepository(undefined, logger);
  const upiIdRepository = new PrismaPaymentUpiIdReadRepository(undefined, logger);
  const ledgerAccountRepository = new PrismaPaymentLedgerAccountReadRepository(undefined, logger);
  const eventPublisherOptions: ConstructorParameters<typeof RabbitMqPaymentEventPublisher>[0] = {
    exchange: process.env.PAYMENT_EVENTS_EXCHANGE ?? "vero.payment"
  };

  if (process.env.RABBITMQ_URL) {
    eventPublisherOptions.rabbitMqUrl = process.env.RABBITMQ_URL;
  }

  const eventPublisher = new RabbitMqPaymentEventPublisher(eventPublisherOptions, logger);
  const ledgerServiceClient = new HttpLedgerServiceClient(process.env.LEDGER_SERVICE_URL ?? "http://localhost:3004", logger);
  const validationService = new PaymentValidationService(
    userRepository,
    upiIdRepository,
    bankAccountRepository,
    ledgerAccountRepository
  );
  const referenceGeneratorService = new PaymentReferenceGeneratorService(paymentRepository);
  const sendMoneyService = new SendMoneyService(
    paymentRepository,
    transactionRepository,
    validationService,
    referenceGeneratorService,
    ledgerServiceClient,
    eventPublisher,
    logger
  );
  const getPaymentService = new GetPaymentService(paymentRepository);
  const getPaymentHistoryService = new GetPaymentHistoryService(paymentRepository, logger);
  const getUserTransactionsService = new GetUserTransactionsService(transactionRepository, logger);
  const getTransactionDetailsService = new GetTransactionDetailsService(transactionRepository);
  const controller = new PaymentController(
    sendMoneyService,
    getPaymentService,
    getPaymentHistoryService,
    getUserTransactionsService,
    getTransactionDetailsService
  );
  const router = createPaymentRoutes(controller, authenticateRequest(jwtAccessSecret));

  return { router };
};
