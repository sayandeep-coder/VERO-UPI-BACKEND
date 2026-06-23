export interface UpiId {
  id: string;
  userId: string;
  bankAccountId: string;
  upiId: string;
  isPrimary: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
