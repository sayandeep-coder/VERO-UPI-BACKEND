import type { UserDevice } from "@vero/shared-types";
import { toUserDevice } from "../mappers/userMapper.js";
import type { DatabaseClient } from "../prisma/client.js";

export interface UpsertUserDeviceInput {
  userId: string;
  deviceId: string;
  deviceName?: string | null;
  deviceModel?: string | null;
  operatingSystem?: string | null;
  appVersion?: string | null;
  lastSeenAt?: Date;
}

export class UserDeviceRepository {
  public constructor(private readonly db: DatabaseClient) {}

  public async upsert(input: UpsertUserDeviceInput): Promise<UserDevice> {
    const existing = await this.db.userDevice.findFirst({
      where: {
        userId: input.userId,
        deviceId: input.deviceId
      }
    });

    const device = existing
      ? await this.db.userDevice.update({
          where: { id: existing.id },
          data: {
            deviceName: input.deviceName,
            deviceModel: input.deviceModel,
            operatingSystem: input.operatingSystem,
            appVersion: input.appVersion,
            isActive: true,
            lastSeenAt: input.lastSeenAt ?? new Date()
          }
        })
      : await this.db.userDevice.create({
          data: {
            userId: input.userId,
            deviceId: input.deviceId,
            deviceName: input.deviceName,
            deviceModel: input.deviceModel,
            operatingSystem: input.operatingSystem,
            appVersion: input.appVersion,
            lastSeenAt: input.lastSeenAt ?? new Date()
          }
        });

    return toUserDevice(device);
  }

  public async listActiveByUserId(userId: string): Promise<UserDevice[]> {
    const devices = await this.db.userDevice.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        lastSeenAt: "desc"
      }
    });

    return devices.map(toUserDevice);
  }
}
