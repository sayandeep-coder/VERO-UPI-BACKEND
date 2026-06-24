import { prisma, type DatabaseClient } from "@vero/shared-database";
import type { Logger } from "@vero/shared-logger";
import type { NotificationPreference } from "../../domain/entities/NotificationPreference.js";
import type {
  NotificationPreferenceRepository,
  UpdateNotificationPreferenceInput
} from "../../domain/repositories/NotificationPreferenceRepository.js";
import { toNotificationPreference } from "./notificationMappers.js";

export class PrismaNotificationPreferenceRepository implements NotificationPreferenceRepository {
  public constructor(
    private readonly db: DatabaseClient = prisma,
    private readonly logger?: Logger
  ) {}

  public async getOrCreate(userId: string): Promise<NotificationPreference> {
    try {
      const preference = await this.db.notificationPreference.upsert({
        where: { userId },
        create: { userId },
        update: {}
      });
      return toNotificationPreference(preference);
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: get notification preferences failed");
      throw error;
    }
  }

  public async update(userId: string, input: UpdateNotificationPreferenceInput): Promise<NotificationPreference> {
    try {
      await this.getOrCreate(userId);
      const preference = await this.db.notificationPreference.update({
        where: { userId },
        data: {
          ...input,
          updatedAt: new Date()
        }
      });
      return toNotificationPreference(preference);
    } catch (error) {
      this.logger?.error({ error, userId }, "Repository error: update notification preferences failed");
      throw error;
    }
  }
}
