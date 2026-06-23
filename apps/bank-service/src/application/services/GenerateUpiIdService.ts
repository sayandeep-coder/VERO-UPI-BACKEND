import { BANK_DEFAULTS } from "../../constants/bankDefaults.js";
import { DuplicateUpiIdError } from "../../domain/errors/BankDomainErrors.js";
import type { UpiId } from "../../domain/entities/UpiId.js";
import type { UpiIdRepository } from "../../domain/repositories/UpiIdRepository.js";
import { UpiIdGenerator } from "../../domain/value-objects/UpiIdGenerator.js";

export interface GenerateUpiIdCommand {
  userId: string;
  bankAccountId: string;
  accountNumber: string;
  fullName: string | null;
  isPrimary: boolean;
}

export class GenerateUpiIdService {
  public constructor(
    private readonly upiIds: UpiIdRepository,
    private readonly upiIdGenerator = new UpiIdGenerator()
  ) {}

  public async generate(command: GenerateUpiIdCommand): Promise<UpiId> {
    const baseUpiId = this.upiIdGenerator.base(command.fullName, command.accountNumber);

    for (let collisionIndex = 0; collisionIndex < 20; collisionIndex += 1) {
      const candidate = this.upiIdGenerator.withCollisionSuffix(baseUpiId, collisionIndex);

      if (await this.upiIds.exists(candidate)) {
        continue;
      }

      try {
        return await this.upiIds.create({
          userId: command.userId,
          bankAccountId: command.bankAccountId,
          upiId: candidate,
          isPrimary: command.isPrimary,
          status: BANK_DEFAULTS.upiStatus
        });
      } catch (error) {
        if (error instanceof DuplicateUpiIdError) {
          continue;
        }

        throw error;
      }
    }

    throw new DuplicateUpiIdError(baseUpiId);
  }
}
