import type { Logger } from "@vero/shared-logger";
import { LedgerController } from "../api/controllers/LedgerController.js";
import { authenticateRequest } from "../api/middlewares/authenticateRequest.js";
import { createLedgerRoutes } from "../api/routes/ledgerRoutes.js";
import { LEDGER_DEFAULTS } from "../constants/ledgerConstants.js";
import { CreateCreditEntryService } from "../application/services/CreateCreditEntryService.js";
import { CreateDebitEntryService } from "../application/services/CreateDebitEntryService.js";
import { CreateLedgerAccountService } from "../application/services/CreateLedgerAccountService.js";
import { CreateLedgerTransactionService } from "../application/services/CreateLedgerTransactionService.js";
import { GetLedgerAccountService } from "../application/services/GetLedgerAccountService.js";
import { GetLedgerTransactionService } from "../application/services/GetLedgerTransactionService.js";
import { ReconciliationService } from "../application/services/ReconciliationService.js";
import { ReverseLedgerTransactionService } from "../application/services/ReverseLedgerTransactionService.js";
import { PrismaBankAccountReadRepository } from "../infrastructure/database/PrismaBankAccountReadRepository.js";
import { PrismaLedgerAccountRepository } from "../infrastructure/database/PrismaLedgerAccountRepository.js";
import { PrismaLedgerEntryRepository } from "../infrastructure/database/PrismaLedgerEntryRepository.js";
import { PrismaLedgerTransactionRepository } from "../infrastructure/database/PrismaLedgerTransactionRepository.js";
import { BankAccountCreatedConsumer } from "../infrastructure/queue/BankAccountCreatedConsumer.js";
import { RabbitMqLedgerEventPublisher } from "../infrastructure/queue/RabbitMqLedgerEventPublisher.js";

export interface LedgerServiceContainerOptions {
  jwtAccessSecret: string;
  logger: Logger;
}

export const createLedgerServiceContainer = ({ jwtAccessSecret, logger }: LedgerServiceContainerOptions) => {
  const ledgerAccountRepository = new PrismaLedgerAccountRepository(undefined, logger);
  const ledgerTransactionRepository = new PrismaLedgerTransactionRepository(undefined, logger);
  const ledgerEntryRepository = new PrismaLedgerEntryRepository(undefined, logger);
  const bankAccountRepository = new PrismaBankAccountReadRepository(undefined, logger);

  const publisherOptions: ConstructorParameters<typeof RabbitMqLedgerEventPublisher>[0] = {
    exchange: process.env.LEDGER_EVENTS_EXCHANGE ?? LEDGER_DEFAULTS.eventExchange
  };

  if (process.env.RABBITMQ_URL) {
    publisherOptions.rabbitMqUrl = process.env.RABBITMQ_URL;
  }

  const eventPublisher = new RabbitMqLedgerEventPublisher(publisherOptions, logger);
  const createLedgerAccountService = new CreateLedgerAccountService(
    ledgerAccountRepository,
    eventPublisher,
    logger
  );
  const createDebitEntryService = new CreateDebitEntryService(ledgerEntryRepository, logger);
  const createCreditEntryService = new CreateCreditEntryService(ledgerEntryRepository, logger);
  const createLedgerTransactionService = new CreateLedgerTransactionService(
    ledgerAccountRepository,
    ledgerTransactionRepository,
    createDebitEntryService,
    createCreditEntryService,
    eventPublisher,
    logger
  );
  const getLedgerAccountService = new GetLedgerAccountService(ledgerAccountRepository);
  const getLedgerTransactionService = new GetLedgerTransactionService(
    ledgerTransactionRepository,
    ledgerAccountRepository
  );
  const reverseLedgerTransactionService = new ReverseLedgerTransactionService(
    ledgerTransactionRepository,
    ledgerAccountRepository,
    createLedgerTransactionService,
    eventPublisher,
    logger
  );
  const reconciliationService = new ReconciliationService(
    ledgerAccountRepository,
    ledgerEntryRepository,
    bankAccountRepository,
    logger
  );
  const controller = new LedgerController(
    createLedgerAccountService,
    getLedgerAccountService,
    createLedgerTransactionService,
    getLedgerTransactionService,
    reverseLedgerTransactionService,
    reconciliationService
  );

  const consumerOptions: ConstructorParameters<typeof BankAccountCreatedConsumer>[0] = {
    exchange: process.env.BANK_EVENTS_EXCHANGE ?? LEDGER_DEFAULTS.inboundExchange,
    queue: process.env.LEDGER_BANK_ACCOUNT_CREATED_QUEUE ?? LEDGER_DEFAULTS.bankAccountCreatedQueue
  };

  if (process.env.RABBITMQ_URL) {
    consumerOptions.rabbitMqUrl = process.env.RABBITMQ_URL;
  }

  const bankAccountCreatedConsumer = new BankAccountCreatedConsumer(
    consumerOptions,
    createLedgerAccountService,
    logger
  );
  const router = createLedgerRoutes(controller, authenticateRequest(jwtAccessSecret));

  return {
    router,
    startConsumers: async () => {
      await bankAccountCreatedConsumer.start();
    }
  };
};
