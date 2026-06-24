export interface UserProfile {
  id: string;
  fullName: string | null;
  status: string;
}

export interface BankAccountProfile {
  id: string;
  userId: string;
  currentBalance: string;
  availableBalance: string;
  status: string;
}

export interface UpiIdProfile {
  id: string;
  userId: string;
  bankAccountId: string;
  upiId: string;
  status: string;
}

export interface LedgerAccountProfile {
  id: string;
  userId: string | null;
  bankAccountId: string | null;
  status: string;
}

export interface UserReadRepository {
  findById(userId: string): Promise<UserProfile | null>;
}

export interface BankAccountReadRepository {
  findById(bankAccountId: string): Promise<BankAccountProfile | null>;
}

export interface UpiIdReadRepository {
  findByUpiId(upiId: string): Promise<UpiIdProfile | null>;
  findPrimaryByUser(userId: string): Promise<UpiIdProfile | null>;
}

export interface LedgerAccountReadRepository {
  findByBankAccountId(bankAccountId: string): Promise<LedgerAccountProfile | null>;
}
