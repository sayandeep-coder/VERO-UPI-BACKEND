# VERO AI Service Ownership

## 1. Ownership Model

VERO AI uses domain driven design to separate capabilities by business responsibility. Each service owns its write model, publishes domain events for state changes, and exposes APIs for capabilities it owns. Other services must not write directly to another service's tables.

## 2. Domain Map

| Bounded Context | Service | Core Aggregate |
| --- | --- | --- |
| Identity and Access | Auth Service | OTP challenge, session, token |
| User Profile | User Service | User |
| Virtual Banking | Bank Service | Bank account, UPI ID |
| Accounting | Ledger Service | Ledger posting, ledger entry |
| Payments | Payment Service | Payment |
| Transaction Experience | Transaction Service | User transaction |
| Financial Intelligence | Analytics Service | Goal, aggregate |
| Messaging | Notification Service | Notification |
| AI Intelligence | AI Service | AI insight, AI conversation |
| Edge Platform | API Gateway | API request policy |

## 3. API Gateway

### Responsibilities

- Public REST API entry point.
- Authentication enforcement for protected endpoints.
- API version routing.
- Request correlation and trace propagation.
- Rate limiting and abuse controls.
- Idempotency key enforcement for mutating payment routes.
- Request and response schema validation at the edge.
- PII-safe access logging.

### Owned Tables

- None in the product database.
- May own gateway-local rate limit and idempotency caches in Redis.

### APIs Exposed

- Exposes all public `/v1` APIs by routing to domain services.
- Does not own business APIs.

### Events Consumed

- None required for MVP.
- Optional: `USER_SUSPENDED` to warm authorization cache.

### Events Published

- None for business events.
- Optional operational events: `API_RATE_LIMIT_EXCEEDED`, `API_AUTH_FAILURE`.

## 4. Auth Service

### Responsibilities

- Create OTP challenges for mobile numbers.
- Verify OTP submissions.
- Issue JWT access tokens.
- Issue and rotate refresh tokens.
- Revoke sessions.
- Enforce OTP attempt limits.
- Produce authenticated identity context.

### Owned Tables

- `otp_challenges` recommended.
- `refresh_tokens` recommended.
- `auth_sessions` recommended.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/auth/otp/send` | Start OTP challenge. |
| `POST` | `/v1/auth/otp/verify` | Verify OTP and issue tokens. |
| `POST` | `/v1/auth/token/refresh` | Rotate refresh token and issue new access token. |
| `POST` | `/v1/auth/logout` | Revoke refresh token. |

### Events Consumed

- `USER_REGISTERED` for session enrichment, optional.
- `USER_SUSPENDED` in future to revoke active sessions.

### Events Published

- `OTP_SENT` internal security event, optional.
- `AUTH_LOGIN_SUCCEEDED` audit event, optional.
- `AUTH_LOGIN_FAILED` audit event, optional.

## 5. User Service

### Responsibilities

- Own user profile lifecycle.
- Enforce one active user per verified mobile number.
- Store encrypted and hashed mobile identity.
- Manage user status changes.
- Provide user profile to authenticated clients and internal services.
- Publish user lifecycle events.

### Owned Tables

- `users`.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/users/me` | Get current user profile. |
| `PATCH` | `/v1/users/me` | Update display profile fields. |
| `GET` | `/internal/users/{user_id}` | Internal user lookup. |
| `POST` | `/internal/users/ensure` | Create or fetch user after OTP verification. |

### Events Consumed

- None required for MVP.

### Events Published

- `USER_REGISTERED`.
- `USER_PROFILE_UPDATED` optional.
- `USER_SUSPENDED` future admin event.

## 6. Bank Service

### Responsibilities

- Create virtual bank accounts automatically after registration.
- Generate virtual account numbers.
- Generate system UPI IDs based on user name and account number.
- Resolve UPI IDs to accounts for payments.
- Enforce account and UPI ID status.
- Manage account freezing and closure in future.

### Owned Tables

- `bank_accounts`.
- `upi_ids`.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/bank/accounts/me` | Get current user's account. |
| `GET` | `/v1/bank/upi-ids/me` | Get current user's UPI IDs. |
| `GET` | `/v1/bank/upi-ids/{upi_id}/resolve` | Resolve UPI ID for payment preview. |
| `POST` | `/internal/bank/accounts` | Create account for user. |
| `GET` | `/internal/bank/accounts/{account_id}` | Internal account lookup. |
| `GET` | `/internal/bank/upi-ids/{upi_id}/resolve` | Internal UPI resolution. |

### Events Consumed

- `USER_REGISTERED`.
- `BALANCE_UPDATED` to update `available_balance` projection, if Ledger Service owns final projection.

### Events Published

- `BANK_ACCOUNT_CREATED`.
- `UPI_ID_CREATED`.
- `BANK_ACCOUNT_FROZEN` future.
- `UPI_ID_DISABLED` future.

## 7. Ledger Service

### Responsibilities

- Own double entry ledger.
- Validate balanced postings.
- Apply atomic debit and credit entries.
- Maintain account-level ledger sequence.
- Maintain balance projection.
- Reject insufficient funds.
- Support reversals through compensating entries.
- Provide ledger statements and reconciliation APIs.

### Owned Tables

- `ledger_entries`.
- Ledger account metadata table recommended.
- Ledger posting metadata table recommended.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/ledger/balance` | Get current user's balance. |
| `GET` | `/v1/ledger/entries` | Get user ledger statement. |
| `POST` | `/internal/ledger/postings/transfer` | Post balanced transfer. |
| `POST` | `/internal/ledger/postings/opening-balance` | Post admin-controlled opening balance. |
| `GET` | `/internal/ledger/postings/{posting_id}` | Fetch posting details. |

### Events Consumed

- `BANK_ACCOUNT_CREATED` for ledger account initialization.
- Admin opening balance command, if modeled as event.

### Events Published

- `BALANCE_UPDATED`.
- `LEDGER_POSTING_CREATED` optional internal event.
- `LEDGER_RECONCILIATION_FAILED` operational event.

## 8. Payment Service

### Responsibilities

- Own payment state machine.
- Initiate send money, request money, and QR payments.
- Validate payer and payee accounts through Bank Service.
- Call Ledger Service for final money movement.
- Enforce idempotency.
- Track payment failures and terminal states.
- Publish payment lifecycle events.

### Owned Tables

- `payments`.
- `payment_requests` optional if collect requests are separated from payments.
- `idempotency_keys` optional service-local table.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/payments/send` | Send money to UPI ID. |
| `POST` | `/v1/payments/requests` | Request money from another user. |
| `POST` | `/v1/payments/requests/{id}/approve` | Approve request money. |
| `POST` | `/v1/payments/requests/{id}/decline` | Decline request money. |
| `POST` | `/v1/payments/qr/preview` | Validate QR payment intent. |
| `POST` | `/v1/payments/qr/pay` | Pay scanned QR. |
| `GET` | `/v1/payments/{payment_id}` | Get payment status and receipt. |

### Events Consumed

- `BANK_ACCOUNT_FROZEN` future to block pending payments.
- `USER_SUSPENDED` future to block pending payments.

### Events Published

- `PAYMENT_INITIATED`.
- `PAYMENT_COMPLETED`.
- `PAYMENT_FAILED`.
- `PAYMENT_REQUEST_CREATED` optional.
- `PAYMENT_REQUEST_DECLINED` optional.

## 9. Transaction Service

### Responsibilities

- Build user-facing transaction history.
- Store transaction snapshots for both payer and payee.
- Provide filters for date range, direction, category, status, and counterparty.
- Support AI search retrieval with scoped access.
- Accept categorization updates from AI or user corrections.

### Owned Tables

- `transactions`.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/transactions` | List current user's transactions. |
| `GET` | `/v1/transactions/{transaction_id}` | Get transaction detail. |
| `PATCH` | `/v1/transactions/{transaction_id}/category` | Update category. |
| `POST` | `/internal/transactions/search` | Internal structured search for AI. |

### Events Consumed

- `PAYMENT_INITIATED`.
- `PAYMENT_COMPLETED`.
- `PAYMENT_FAILED`.
- `AI_TRANSACTION_CATEGORIZED` optional.

### Events Published

- `TRANSACTION_CREATED` optional.
- `TRANSACTION_CATEGORIZED` optional.

## 10. Analytics Service

### Responsibilities

- Own goals.
- Maintain spend aggregates by user, category, and period.
- Calculate goal progress.
- Provide analytics inputs to AI Service.
- Publish goal lifecycle events.

### Owned Tables

- `goals`.
- Spend aggregate tables recommended.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/goals` | Create goal. |
| `GET` | `/v1/goals` | List goals. |
| `GET` | `/v1/goals/{goal_id}` | Get goal detail. |
| `PATCH` | `/v1/goals/{goal_id}` | Update goal. |
| `POST` | `/v1/goals/{goal_id}/complete` | Mark goal complete. |
| `GET` | `/v1/analytics/spending-summary` | User spending summary. |
| `GET` | `/internal/analytics/users/{user_id}/features` | AI feature retrieval. |

### Events Consumed

- `TRANSACTION_CREATED`.
- `PAYMENT_COMPLETED`.
- `PAYMENT_FAILED`.
- `AI_INSIGHT_GENERATED` for recommended goals.

### Events Published

- `GOAL_CREATED`.
- `GOAL_COMPLETED`.
- `GOAL_UPDATED`.
- `SPEND_AGGREGATE_UPDATED` optional.

## 11. Notification Service

### Responsibilities

- Create in-app notifications.
- Deliver future push and SMS notifications.
- Deduplicate notifications by event.
- Store read and delivery status.
- Provide notification center APIs.

### Owned Tables

- `notifications`.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/notifications` | List notifications. |
| `POST` | `/v1/notifications/{id}/read` | Mark notification read. |
| `POST` | `/internal/notifications` | Create notification directly, if needed. |

### Events Consumed

- `BANK_ACCOUNT_CREATED`.
- `UPI_ID_CREATED`.
- `PAYMENT_COMPLETED`.
- `PAYMENT_FAILED`.
- `GOAL_CREATED`.
- `GOAL_COMPLETED`.
- `AI_INSIGHT_GENERATED`.

### Events Published

- `NOTIFICATION_CREATED` optional.
- `NOTIFICATION_DELIVERED` optional.
- `NOTIFICATION_FAILED` optional.

## 12. AI Service

### Responsibilities

- Own Gemini integration.
- Provide AI chat over user financial data.
- Categorize transactions.
- Generate spending insights.
- Detect subscriptions.
- Forecast spending.
- Calculate financial health explanations.
- Recommend goals.
- Store generated insights and model trace metadata.

### Owned Tables

- `ai_insights`.
- AI conversation and message tables recommended.
- Prompt version registry recommended.

### APIs Exposed

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/ai/chat` | Ask financial question. |
| `GET` | `/v1/ai/insights` | List AI insights. |
| `GET` | `/v1/ai/insights/{insight_id}` | Get insight detail. |
| `POST` | `/v1/ai/insights/generate` | Trigger insight generation. |
| `POST` | `/internal/ai/categorize` | Categorize transaction batch. |

### Events Consumed

- `TRANSACTION_CREATED`.
- `PAYMENT_COMPLETED`.
- `GOAL_CREATED`.
- `GOAL_COMPLETED`.

### Events Published

- `AI_INSIGHT_GENERATED`.
- `AI_TRANSACTION_CATEGORIZED` optional.
- `AI_MODEL_CALL_FAILED` operational event.

## 13. Ownership Rules

- Services can read another service's public API or subscribed events, not its database tables.
- Ledger Service is the only service allowed to create ledger entries.
- Payment Service is the only service allowed to create payment records.
- AI Service can generate recommendations but cannot mutate payments, ledger entries, bank accounts, or balances.
- Admin-controlled initial balance must be posted through Ledger Service, not by updating account balance directly.
- Cross-service workflows must use idempotency keys and correlation IDs.

