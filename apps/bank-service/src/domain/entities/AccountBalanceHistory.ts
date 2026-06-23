export interface AccountBalanceHistory {
  id: string;
  userId: string;
  bankAccountId: string;
  previousBalance: string;
  currentBalance: string;
  availableBalance: string;
  changeAmount: string;
  changeType: string;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: Date;
}
