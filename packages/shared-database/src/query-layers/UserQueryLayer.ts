import type { PublicUserProfile } from "@vero/shared-types";
import { toPublicUserProfile } from "../mappers/userMapper.js";
import type { DatabaseClient } from "../prisma/client.js";

export class UserQueryLayer {
  public constructor(private readonly db: DatabaseClient) {}

  public async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    const user = await this.db.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      }
    });

    return user ? toPublicUserProfile(user) : null;
  }

  public async searchActiveUsersByMobilePrefix(prefix: string, limit = 20): Promise<PublicUserProfile[]> {
    const users = await this.db.user.findMany({
      where: {
        mobileNumber: {
          startsWith: prefix
        },
        status: "ACTIVE",
        deletedAt: null
      },
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    });

    return users.map(toPublicUserProfile);
  }
}
