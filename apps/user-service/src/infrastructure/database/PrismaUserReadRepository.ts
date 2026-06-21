import { UserQueryLayer, prisma } from "@vero/shared-database";
import type { PublicUserProfile } from "@vero/shared-types";
import type { UserReadRepository } from "../../domain/repositories/UserReadRepository.js";

export class PrismaUserReadRepository implements UserReadRepository {
  private readonly queries = new UserQueryLayer(prisma);

  public async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    return this.queries.getPublicProfile(userId);
  }
}
