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

    const mutableDeviceData: {
      deviceName?: string | null;
      deviceModel?: string | null;
      operatingSystem?: string | null;
      appVersion?: string | null;
      isActive: true;
      lastSeenAt: Date;
    } = {
      isActive: true,
      lastSeenAt: input.lastSeenAt ?? new Date()
    };

    const createDeviceData: {
      userId: string;
      deviceId: string;
      deviceName?: string | null;
      deviceModel?: string | null;
      operatingSystem?: string | null;
      appVersion?: string | null;
      lastSeenAt: Date;
    } = {
      userId: input.userId,
      deviceId: input.deviceId,
      lastSeenAt: input.lastSeenAt ?? new Date()
    };

    if (input.deviceName !== undefined) {
      mutableDeviceData.deviceName = input.deviceName;
      createDeviceData.deviceName = input.deviceName;
    }

    if (input.deviceModel !== undefined) {
      mutableDeviceData.deviceModel = input.deviceModel;
      createDeviceData.deviceModel = input.deviceModel;
    }

    if (input.operatingSystem !== undefined) {
      mutableDeviceData.operatingSystem = input.operatingSystem;
      createDeviceData.operatingSystem = input.operatingSystem;
    }

    if (input.appVersion !== undefined) {
      mutableDeviceData.appVersion = input.appVersion;
      createDeviceData.appVersion = input.appVersion;
    }

    const device = existing
      ? await this.db.userDevice.update({
          where: { id: existing.id },
          data: mutableDeviceData
        })
      : await this.db.userDevice.create({
          data: createDeviceData
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
