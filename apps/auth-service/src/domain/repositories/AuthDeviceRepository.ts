import type { UserDevice } from "@vero/shared-types";

export interface UpsertAuthDeviceInput {
  userId: string;
  deviceId: string;
  deviceName?: string | null;
  deviceModel?: string | null;
  operatingSystem?: string | null;
  appVersion?: string | null;
}

export interface AuthDeviceRepository {
  upsert(input: UpsertAuthDeviceInput): Promise<UserDevice>;
}
