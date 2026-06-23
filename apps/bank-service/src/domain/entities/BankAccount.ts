export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: string;
  currentBalance: string;
  availableBalance: string;
  currency: string;
  isPrimary: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
