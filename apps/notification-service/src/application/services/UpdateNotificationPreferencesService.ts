import type { Logger } from "@vero/shared-logger";
import type {
  NotificationPreferenceRepository,
  UpdateNotificationPreferenceInput
} from "../../domain/repositories/NotificationPreferenceRepository.js";
import { toPreferenceDto, type NotificationPreferenceDto } from "../dto/NotificationDtos.js";

export class UpdateNotificationPreferencesService {
  public constructor(
    private readonly preferences: NotificationPreferenceRepository,
    private readonly logger: Logger
  ) {}

  public async update(userId: string, input: UpdateNotificationPreferenceInput): Promise<NotificationPreferenceDto> {
    const preference = await this.preferences.update(userId, input);
    this.logger.info({ userId }, "Preferences Updated");
    return toPreferenceDto(preference);
  }
}
