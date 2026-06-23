import type { DatabaseClient } from "../prisma/client.js";
import { toUser } from "../mappers/userMapper.js";
import type { User } from "@vero/shared-types";

export interface CreateUserInput {
  mobileNumber: string;
  fullName?: string | null;
  email?: string | null;
  profilePicture?: string | null;
}

export interface UpdateUserInput {
  fullName?: string | null;
  email?: string | null;
  profilePicture?: string | null;
  lastLoginAt?: Date;
}

export class UserRepository {
  public constructor(private readonly db: DatabaseClient) {}

  public async create(input: CreateUserInput): Promise<User> {
    const data: {
      mobileNumber: string;
      fullName?: string | null;
      email?: string | null;
      profilePicture?: string | null;
    } = {
      mobileNumber: input.mobileNumber
    };

    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.email !== undefined) data.email = input.email;
    if (input.profilePicture !== undefined) data.profilePicture = input.profilePicture;

    const user = await this.db.user.create({
      data
    });

    return toUser(user);
  }

  public async findById(userId: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      }
    });

    return user ? toUser(user) : null;
  }

  public async findByMobileNumber(mobileNumber: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: {
        mobileNumber,
        deletedAt: null
      }
    });

    return user ? toUser(user) : null;
  }

  public async update(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await this.db.user.update({
      where: { id: userId },
      data: input
    });

    return toUser(user);
  }

  public async touchLastLogin(userId: string, loggedInAt = new Date()): Promise<User> {
    return this.update(userId, { lastLoginAt: loggedInAt });
  }
}
