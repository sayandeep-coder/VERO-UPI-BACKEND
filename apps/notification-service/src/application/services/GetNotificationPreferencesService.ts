import type { NotificationPreferenceRepository } from "../../domain/repositories/NotificationPreferenceRepository.js";
import { toPreferenceDto, type NotificationPreferenceDto } from "../dto/NotificationDtos.js";

export class GetNotificationPreferencesService {
  public constructor(private readonly preferences: NotificationPreferenceRepository) {}

  public async get(userId: string): Promise<NotificationPreferenceDto> {
    return toPreferenceDto(await this.preferences.getOrCreate(userId));
  }
}
