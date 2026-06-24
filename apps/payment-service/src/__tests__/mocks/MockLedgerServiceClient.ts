import type {
  CreateLedgerPostingInput,
  LedgerPostingResult,
  LedgerServiceClient
} from "../../application/services/LedgerServiceClient.js";

export class MockLedgerServiceClient implements LedgerServiceClient {
  public readonly postings: CreateLedgerPostingInput[] = [];

  public async createP2pPosting(input: CreateLedgerPostingInput): Promise<LedgerPostingResult> {
    this.postings.push(input);
    return {
      ledgerTransactionId: "00000000-0000-0000-0000-000000000001",
      status: "COMPLETED"
    };
  }
}
