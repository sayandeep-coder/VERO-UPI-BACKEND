import { NotFoundError } from "@vero/shared-errors";
import type { PublicUserProfile } from "@vero/shared-types";
import type { GetUserProfileQuery } from "../queries/GetUserProfileQuery.js";
import type { UserReadRepository } from "../../domain/repositories/UserReadRepository.js";

export class UserProfileService {
  public constructor(private readonly users: UserReadRepository) {}

  public async getProfile(query: GetUserProfileQuery): Promise<PublicUserProfile> {
    const user = await this.users.getPublicProfile(query.userId);

    if (!user) {
      throw new NotFoundError("User profile was not found");
    }

    return user;
  }
}
