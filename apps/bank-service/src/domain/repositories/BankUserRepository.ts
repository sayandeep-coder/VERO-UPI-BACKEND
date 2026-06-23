export interface BankUserProfile {
  id: string;
  fullName: string | null;
  status: string;
}

export interface BankUserRepository {
  findById(userId: string): Promise<BankUserProfile | null>;
}
