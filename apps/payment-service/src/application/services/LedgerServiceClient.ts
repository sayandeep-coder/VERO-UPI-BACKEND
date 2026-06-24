export interface CreateLedgerPostingInput {
  referenceType: string;
  referenceId: string;
  description: string;
  senderLedgerAccountId: string;
  receiverLedgerAccountId: string;
  amount: string;
  authorizationHeader?: string;
}

export interface LedgerPostingResult {
  ledgerTransactionId: string;
  status: string;
}

export interface LedgerServiceClient {
  createP2pPosting(input: CreateLedgerPostingInput): Promise<LedgerPostingResult>;
}
