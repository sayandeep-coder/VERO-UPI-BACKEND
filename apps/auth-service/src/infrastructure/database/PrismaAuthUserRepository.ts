import { prisma, UserRepository } from "@vero/shared-database";
import type { User } from "@vero/shared-types";
import type { AuthUserRepository, CreateAuthUserInput } from "../../domain/repositories/AuthUserRepository.js";

export class PrismaAuthUserRepository implements AuthUserRepository {
  private readonly users = new UserRepository(prisma);

  public async create(input: CreateAuthUserInput): Promise<User> {
    return this.users.create(input);
  }

  public async findByMobileNumber(mobileNumber: string): Promise<User | null> {
    return this.users.findByMobileNumber(mobileNumber);
  }

  public async touchLastLogin(userId: string): Promise<User> {
    return this.users.touchLastLogin(userId);
  }
}
