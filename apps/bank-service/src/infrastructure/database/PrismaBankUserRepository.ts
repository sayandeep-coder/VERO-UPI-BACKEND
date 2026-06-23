import { prisma, UserRepository } from "@vero/shared-database";
import type { BankUserProfile, BankUserRepository } from "../../domain/repositories/BankUserRepository.js";

export class PrismaBankUserRepository implements BankUserRepository {
  private readonly users = new UserRepository(prisma);

  public async findById(userId: string): Promise<BankUserProfile | null> {
    const user = await this.users.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      status: user.status
    };
  }
}
