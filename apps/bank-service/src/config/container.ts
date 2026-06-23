import type { Logger } from "@vero/shared-logger";
import { BankController } from "../api/controllers/BankController.js";
import { authenticateRequest } from "../api/middlewares/authenticateRequest.js";
import { createBankRoutes } from "../api/routes/bankRoutes.js";
import { CreateBankAccountService } from "../application/services/CreateBankAccountService.js";
import { GenerateUpiIdService } from "../application/services/GenerateUpiIdService.js";
import { GetBalanceService } from "../application/services/GetBalanceService.js";
import { GetBankAccountService } from "../application/services/GetBankAccountService.js";
import { GetUpiIdsService } from "../application/services/GetUpiIdsService.js";
import { GetUserAccountsService } from "../application/services/GetUserAccountsService.js";
import { PrismaAccountLimitRepository } from "../infrastructure/database/PrismaAccountLimitRepository.js";
import { PrismaBankAccountRepository } from "../infrastructure/database/PrismaBankAccountRepository.js";
import { PrismaBankUserRepository } from "../infrastructure/database/PrismaBankUserRepository.js";
import { PrismaUpiIdRepository } from "../infrastructure/database/PrismaUpiIdRepository.js";
import { RabbitMqBankEventPublisher } from "../infrastructure/queue/RabbitMqBankEventPublisher.js";

export interface BankServiceContainerOptions {
  jwtAccessSecret: string;
  logger: Logger;
}

export const createBankServiceContainer = ({ jwtAccessSecret, logger }: BankServiceContainerOptions) => {
  const userRepository = new PrismaBankUserRepository();
  const bankAccountRepository = new PrismaBankAccountRepository(undefined, logger);
  const upiIdRepository = new PrismaUpiIdRepository(undefined, logger);
  const accountLimitRepository = new PrismaAccountLimitRepository(undefined, logger);
  const eventPublisherOptions: ConstructorParameters<typeof RabbitMqBankEventPublisher>[0] = {
    exchange: process.env.BANK_EVENTS_EXCHANGE ?? "vero.bank"
  };

  if (process.env.RABBITMQ_URL) {
    eventPublisherOptions.rabbitMqUrl = process.env.RABBITMQ_URL;
  }

  const eventPublisher = new RabbitMqBankEventPublisher(eventPublisherOptions, logger);

  const generateUpiIdService = new GenerateUpiIdService(upiIdRepository);
  const createBankAccountService = new CreateBankAccountService(
    userRepository,
    bankAccountRepository,
    accountLimitRepository,
    generateUpiIdService,
    eventPublisher,
    logger
  );
  const getBankAccountService = new GetBankAccountService(bankAccountRepository);
  const getUserAccountsService = new GetUserAccountsService(bankAccountRepository);
  const getBalanceService = new GetBalanceService(bankAccountRepository, logger);
  const getUpiIdsService = new GetUpiIdsService(upiIdRepository);
  const bankController = new BankController(
    createBankAccountService,
    getBankAccountService,
    getUserAccountsService,
    getBalanceService,
    getUpiIdsService
  );
  const router = createBankRoutes(bankController, authenticateRequest(jwtAccessSecret));

  return { router };
};
