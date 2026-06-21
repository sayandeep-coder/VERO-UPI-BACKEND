import type { PublicUserProfile } from "@vero/shared-types";

export interface UserReadRepository {
  getPublicProfile(userId: string): Promise<PublicUserProfile | null>;
}
