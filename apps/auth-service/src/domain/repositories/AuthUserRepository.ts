import type { User } from "@vero/shared-types";

export interface CreateAuthUserInput {
  mobileNumber: string;
  fullName?: string | null;
}

export interface AuthUserRepository {
  create(input: CreateAuthUserInput): Promise<User>;
  findByMobileNumber(mobileNumber: string): Promise<User | null>;
  touchLastLogin(userId: string): Promise<User>;
}
