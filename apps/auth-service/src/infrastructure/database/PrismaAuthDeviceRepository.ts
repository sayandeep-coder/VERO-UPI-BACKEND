import { prisma, UserDeviceRepository } from "@vero/shared-database";
import type { UserDevice } from "@vero/shared-types";
import type { AuthDeviceRepository, UpsertAuthDeviceInput } from "../../domain/repositories/AuthDeviceRepository.js";

export class PrismaAuthDeviceRepository implements AuthDeviceRepository {
  private readonly devices = new UserDeviceRepository(prisma);

  public async upsert(input: UpsertAuthDeviceInput): Promise<UserDevice> {
    return this.devices.upsert(input);
  }
}
