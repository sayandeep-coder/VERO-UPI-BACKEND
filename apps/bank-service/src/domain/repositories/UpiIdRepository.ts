import type { UpiId } from "../entities/UpiId.js";

export interface CreateUpiIdInput {
  userId: string;
  bankAccountId: string;
  upiId: string;
  isPrimary: boolean;
  status: string;
}

export interface UpiIdRepository {
  create(input: CreateUpiIdInput): Promise<UpiId>;
  exists(upiId: string): Promise<boolean>;
  findByUserId(userId: string): Promise<UpiId[]>;
  findByAccountId(bankAccountId: string): Promise<UpiId[]>;
}
