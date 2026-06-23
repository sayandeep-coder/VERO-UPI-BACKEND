import { Prisma } from "@prisma/client";
import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import { DuplicateUpiIdError } from "../../domain/errors/BankDomainErrors.js";
import type { UpiId } from "../../domain/entities/UpiId.js";
import type { CreateUpiIdInput, UpiIdRepository } from "../../domain/repositories/UpiIdRepository.js";
import { toUpiId } from "./bankMappers.js";

export class PrismaUpiIdRepository implements UpiIdRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async create(input: CreateUpiIdInput): Promise<UpiId> {
    try {
      const upi = await this.db.upiId.create({
        data: input
      });

      return toUpiId(upi);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateUpiIdError(input.upiId);
      }

      this.logger?.error({ error, userId: input.userId }, "Repository error: create UPI ID failed");
      throw error;
    }
  }

  public async exists(upiId: string): Promise<boolean> {
    try {
      const count = await this.db.upiId.count({
        where: { upiId, deletedAt: null }
      });

      return count > 0;
    } catch (error) {
      this.logger?.error({ error, upiId }, "Repository error: UPI ID existence check failed");
      throw error;
    }
  }

  public async findByUserId(userId: string): Promise<UpiId[]> {
    try {
      const upiIds = await this.db.upiId.findMany({
        where: { userId, deletedAt: null },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
      });

      return upiIds.map(toUpiId);
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: find UPI IDs by user failed");
      throw error;
    }
  }

  public async findByAccountId(bankAccountId: string): Promise<UpiId[]> {
    try {
      const upiIds = await this.db.upiId.findMany({
        where: { bankAccountId, deletedAt: null },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
      });

      return upiIds.map(toUpiId);
    } catch (error) {
      this.logger?.error({ error, bankAccountId }, "Repository error: find UPI IDs by account failed");
      throw error;
    }
  }
}
