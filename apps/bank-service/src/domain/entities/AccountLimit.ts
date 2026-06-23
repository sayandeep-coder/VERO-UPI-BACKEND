export interface AccountLimit {
  id: string;
  userId: string;
  bankAccountId: string;
  dailyLimit: string;
  monthlyLimit: string;
  dailyUsedAmount: string;
  monthlyUsedAmount: string;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
