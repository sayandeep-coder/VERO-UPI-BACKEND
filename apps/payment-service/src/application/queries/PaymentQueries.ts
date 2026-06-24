export interface UserScopedPaymentQuery {
  userId: string;
  paymentId: string;
}

export interface UserScopedTransactionQuery {
  userId: string;
  transactionId: string;
}

export interface PaginatedUserQuery {
  userId: string;
  limit: number;
  offset: number;
}
