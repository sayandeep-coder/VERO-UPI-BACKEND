export interface BankAccountBalance {
  id: string;
  currentBalance: string;
  availableBalance: string;
}

export interface BankAccountReadRepository {
  findBalanceById(bankAccountId: string): Promise<BankAccountBalance | null>;
}
