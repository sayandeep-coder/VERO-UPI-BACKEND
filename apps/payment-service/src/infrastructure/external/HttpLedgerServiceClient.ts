import { AppError } from "@vero/shared-errors";
import type { Logger } from "@vero/shared-logger";
import type {
  CreateLedgerPostingInput,
  LedgerPostingResult,
  LedgerServiceClient
} from "../../application/services/LedgerServiceClient.js";

export class HttpLedgerServiceClient implements LedgerServiceClient {
  public constructor(
    private readonly ledgerServiceUrl: string,
    private readonly logger: Logger
  ) {}

  public async createP2pPosting(input: CreateLedgerPostingInput): Promise<LedgerPostingResult> {
    const response = await fetch(`${this.ledgerServiceUrl.replace(/\/$/, "")}/v1/ledger/transactions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(input.authorizationHeader ? { authorization: input.authorizationHeader } : {})
      },
      body: JSON.stringify({
        reference_type: input.referenceType,
        reference_id: input.referenceId,
        description: input.description,
        entries: [
          {
            ledger_account_id: input.senderLedgerAccountId,
            entry_type: "DEBIT",
            amount: input.amount,
            description: input.description
          },
          {
            ledger_account_id: input.receiverLedgerAccountId,
            entry_type: "CREDIT",
            amount: input.amount,
            description: input.description
          }
        ]
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | { data?: { id?: string; status?: string }; error?: { message?: string } }
      | null;

    if (!response.ok || !payload?.data?.id) {
      this.logger.error({ status: response.status, payload }, "Ledger Failure");
      throw new AppError("LEDGER_POSTING_FAILED", payload?.error?.message ?? "Ledger posting failed", 502);
    }

    return {
      ledgerTransactionId: payload.data.id,
      status: payload.data.status ?? "COMPLETED"
    };
  }
}
