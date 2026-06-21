# VERO AI API Contracts

## 1. API Design Standards

| Standard | Decision |
| --- | --- |
| Protocol | HTTPS REST JSON. |
| Public version prefix | `/v1`. |
| Date/time format | ISO 8601 UTC. |
| Money format | Decimal string with two fractional digits. |
| Currency | `INR` only for MVP. |
| Authentication | Bearer JWT except OTP send and verify. |
| Idempotency | Required for payment mutation APIs. |
| Pagination | Cursor based for list APIs. |
| Error format | Standard error envelope. |

## 2. Common Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Protected APIs | `Bearer <access_token>`. |
| `X-Request-ID` | Optional | Client request ID. Gateway creates one if absent. |
| `Idempotency-Key` | Payment mutations | Unique key per user action. |
| `Content-Type` | Requests with body | `application/json`. |
| `Accept` | Optional | `application/json`. |

## 3. Authentication Requirements

| Route Class | Requirement |
| --- | --- |
| OTP send | No JWT. Rate limited by IP and mobile number. |
| OTP verify | No JWT. Requires challenge ID and OTP. |
| Token refresh | Refresh token required. |
| User, bank, payments, transactions, goals, notifications, AI | Access token required. |
| Admin APIs | Access token with admin role. |
| Internal APIs | Service-to-service auth with mTLS or signed service JWT. |

## 4. Versioning Strategy

- Public APIs are versioned in the URL: `/v1`.
- Backward-compatible fields may be added without changing version.
- Breaking request or response changes require `/v2`.
- Event schemas are versioned independently with `event_version`.
- Mobile clients should ignore unknown response fields.

## 5. Standard Success Envelope

| Field | Type | Description |
| --- | --- | --- |
| `data` | Object or Array | Response payload. |
| `meta` | Object | Pagination, request ID, or timing metadata. |

## 6. Standard Error Envelope

| Field | Type | Description |
| --- | --- | --- |
| `error.code` | String | Stable machine-readable code. |
| `error.message` | String | Safe user-facing message. |
| `error.details` | Object | Field-level validation errors or context. |
| `error.request_id` | String | Correlation ID for support. |

### Common Error Codes

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Request failed validation. |
| 401 | `UNAUTHENTICATED` | Missing or invalid token. |
| 403 | `FORBIDDEN` | Authenticated but not allowed. |
| 404 | `NOT_FOUND` | Resource not found or hidden. |
| 409 | `IDEMPOTENCY_CONFLICT` | Idempotency key reused with different body. |
| 409 | `INVALID_STATE` | Resource state does not allow operation. |
| 422 | `INSUFFICIENT_FUNDS` | Payment cannot be completed. |
| 429 | `RATE_LIMITED` | Too many requests. |
| 500 | `INTERNAL_ERROR` | Unexpected server error. |
| 503 | `SERVICE_UNAVAILABLE` | Downstream unavailable. |

## 7. Auth APIs

### 7.1 Send OTP

`POST /v1/auth/otp/send`

Authentication: None.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `mobile_number` | String | Yes | E.164 format, India numbers allowed for MVP. |
| `purpose` | String | Yes | `LOGIN_OR_REGISTER`. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `challenge_id` | UUID | OTP challenge ID. |
| `expires_in_seconds` | Integer | OTP TTL. |
| `resend_after_seconds` | Integer | Minimum resend delay. |

Validation:

- Mobile number must normalize to a valid E.164 value.
- Maximum 3 OTP sends per mobile number per 15 minutes.
- Maximum 10 OTP sends per IP per hour.

### 7.2 Verify OTP

`POST /v1/auth/otp/verify`

Authentication: None.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `challenge_id` | UUID | Yes | Existing unexpired challenge. |
| `otp` | String | Yes | 6 digits. |
| `display_name` | String | Conditional | Required for first registration. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `access_token` | String | JWT access token. |
| `expires_in_seconds` | Integer | Access token TTL. |
| `refresh_token` | String | Opaque refresh token. |
| `user` | Object | User profile. |
| `is_new_user` | Boolean | Whether user was created. |

Validation:

- OTP expires after configured TTL.
- Maximum 5 verification attempts per challenge.
- Display name length 2 to 120 characters.

### 7.3 Refresh Token

`POST /v1/auth/token/refresh`

Authentication: Refresh token in body.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `refresh_token` | String | Yes | Active, unexpired, not previously rotated. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `access_token` | String | New JWT. |
| `expires_in_seconds` | Integer | Access token TTL. |
| `refresh_token` | String | Rotated refresh token. |

### 7.4 Logout

`POST /v1/auth/logout`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `refresh_token` | String | Yes | Token to revoke. |

Response: Empty success object.

## 8. User APIs

### 8.1 Get Current User

`GET /v1/users/me`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | User ID. |
| `display_name` | String | Display name. |
| `mobile_number_masked` | String | Masked mobile number. |
| `status` | String | User status. |
| `created_at` | Timestamp | Registration time. |

### 8.2 Update Current User

`PATCH /v1/users/me`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `display_name` | String | No | 2 to 120 characters. |

Response: Updated user object.

## 9. Bank APIs

### 9.1 Get My Account

`GET /v1/bank/accounts/me`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `bank_account_id` | UUID | Account ID. |
| `account_number_masked` | String | Masked virtual account number. |
| `account_type` | String | `SAVINGS`. |
| `currency` | String | `INR`. |
| `available_balance` | String | Ledger-derived balance. |
| `status` | String | Account status. |
| `opened_at` | Timestamp | Opened time. |

### 9.2 Get My UPI IDs

`GET /v1/bank/upi-ids/me`

Authentication: Bearer JWT.

Response fields:

| Field | Type | Description |
| --- | --- | --- |
| `upi_ids` | Array | User UPI IDs. |
| `upi_ids[].upi_id` | String | UPI ID. |
| `upi_ids[].is_primary` | Boolean | Primary flag. |
| `upi_ids[].status` | String | UPI ID status. |

### 9.3 Resolve UPI ID

`GET /v1/bank/upi-ids/{upi_id}/resolve`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `upi_id` | String | Resolved UPI ID. |
| `display_name` | String | Recipient display name. |
| `status` | String | `ACTIVE` if payable. |

Validation:

- UPI ID must end with `@vero`.
- Disabled or missing UPI IDs return `NOT_FOUND` or `INVALID_STATE`.

## 10. Ledger APIs

### 10.1 Get Balance

`GET /v1/ledger/balance`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `available_balance` | String | Current available balance. |
| `currency` | String | `INR`. |
| `as_of_sequence` | Long | Ledger sequence used. |
| `as_of_time` | Timestamp | Balance timestamp. |

### 10.2 Get Ledger Entries

`GET /v1/ledger/entries?cursor=<cursor>&limit=20`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `entries` | Array | Ledger statement entries. |
| `entries[].entry_type` | String | `DEBIT` or `CREDIT`. |
| `entries[].amount` | String | Amount. |
| `entries[].balance_after` | String | Balance after entry. |
| `entries[].created_at` | Timestamp | Posting time. |
| `next_cursor` | String | Cursor for next page. |

## 11. Payment APIs

### 11.1 Send Money

`POST /v1/payments/send`

Authentication: Bearer JWT.

Headers: `Idempotency-Key` required.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `payee_upi_id` | String | Yes | Existing active `@vero` UPI ID. |
| `amount` | String | Yes | Decimal, greater than `0.00`, max configured limit. |
| `currency` | String | Yes | `INR`. |
| `note` | String | No | Max 255 characters. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `payment_id` | UUID | Payment ID. |
| `payment_reference` | String | Receipt reference. |
| `status` | String | `COMPLETED` or `FAILED`. |
| `amount` | String | Amount. |
| `payer_upi_id` | String | Sender UPI ID. |
| `payee_upi_id` | String | Recipient UPI ID. |
| `completed_at` | Timestamp | Completion time if successful. |
| `failure_code` | String | Failure code if failed. |

### 11.2 Request Money

`POST /v1/payments/requests`

Authentication: Bearer JWT.

Headers: `Idempotency-Key` required.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `payer_upi_id` | String | Yes | User to request money from. |
| `amount` | String | Yes | Greater than `0.00`. |
| `currency` | String | Yes | `INR`. |
| `note` | String | No | Max 255 characters. |
| `expires_at` | Timestamp | No | Must be future, max 7 days. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `request_id` | UUID | Payment request ID. |
| `status` | String | `INITIATED`. |
| `expires_at` | Timestamp | Request expiry. |

### 11.3 Approve Request Money

`POST /v1/payments/requests/{request_id}/approve`

Authentication: Bearer JWT. Must be requested payer.

Headers: `Idempotency-Key` required.

Response: Same as Send Money response.

### 11.4 Decline Request Money

`POST /v1/payments/requests/{request_id}/decline`

Authentication: Bearer JWT. Must be requested payer.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `request_id` | UUID | Request ID. |
| `status` | String | `CANCELLED` or `FAILED`. |

### 11.5 QR Preview

`POST /v1/payments/qr/preview`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `qr_payload` | String | Yes | Signed or unsigned VERO QR payload. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `payee_upi_id` | String | Recipient UPI ID. |
| `payee_name` | String | Recipient display name. |
| `amount` | String | Amount if fixed. |
| `currency` | String | `INR`. |
| `note` | String | QR note. |
| `is_amount_editable` | Boolean | Whether user can edit amount. |

### 11.6 Pay QR

`POST /v1/payments/qr/pay`

Authentication: Bearer JWT.

Headers: `Idempotency-Key` required.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `qr_payload` | String | Yes | Payment intent. |
| `amount` | String | Conditional | Required if QR does not fix amount. |
| `note` | String | No | Max 255 characters. |

Response: Same as Send Money response.

### 11.7 Get Payment

`GET /v1/payments/{payment_id}`

Authentication: Bearer JWT. User must be payer or payee.

Response: Payment receipt object.

## 12. Transaction APIs

### 12.1 List Transactions

`GET /v1/transactions?cursor=<cursor>&limit=20&from=<date>&to=<date>&direction=DEBIT&category=food`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `transactions` | Array | Transaction list. |
| `transactions[].id` | UUID | Transaction ID. |
| `transactions[].direction` | String | `DEBIT` or `CREDIT`. |
| `transactions[].amount` | String | Amount. |
| `transactions[].counterparty_upi_id` | String | Counterparty. |
| `transactions[].category` | String | Category. |
| `transactions[].status` | String | Transaction status. |
| `transactions[].occurred_at` | Timestamp | Transaction time. |
| `next_cursor` | String | Cursor for next page. |

### 12.2 Get Transaction

`GET /v1/transactions/{transaction_id}`

Authentication: Bearer JWT. User must own transaction.

Response: Transaction detail with linked payment receipt summary.

### 12.3 Update Category

`PATCH /v1/transactions/{transaction_id}/category`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `category` | String | Yes | Allowed category taxonomy. |

Response: Updated transaction object.

## 13. Goal APIs

### 13.1 Create Goal

`POST /v1/goals`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | String | Yes | 2 to 120 characters. |
| `target_amount` | String | Yes | Greater than `0.00`. |
| `currency` | String | Yes | `INR`. |
| `target_date` | Date | No | Must be future. |

Response: Goal object.

### 13.2 List Goals

`GET /v1/goals?status=ACTIVE`

Authentication: Bearer JWT.

Response: Array of goal objects.

### 13.3 Update Goal

`PATCH /v1/goals/{goal_id}`

Authentication: Bearer JWT. User must own goal.

Request fields: `name`, `target_amount`, `target_date`, `status`.

Response: Updated goal object.

### 13.4 Complete Goal

`POST /v1/goals/{goal_id}/complete`

Authentication: Bearer JWT. User must own goal.

Response: Completed goal object.

## 14. Analytics APIs

### 14.1 Spending Summary

`GET /v1/analytics/spending-summary?from=<date>&to=<date>&group_by=category`

Authentication: Bearer JWT.

Response:

| Field | Type | Description |
| --- | --- | --- |
| `total_spend` | String | Total debit amount. |
| `currency` | String | `INR`. |
| `groups` | Array | Spend groups. |
| `groups[].key` | String | Category or time bucket. |
| `groups[].amount` | String | Group amount. |
| `groups[].transaction_count` | Integer | Number of transactions. |

## 15. Notification APIs

### 15.1 List Notifications

`GET /v1/notifications?cursor=<cursor>&limit=20&status=UNREAD`

Authentication: Bearer JWT.

Response: Notification list with cursor.

### 15.2 Mark Notification Read

`POST /v1/notifications/{notification_id}/read`

Authentication: Bearer JWT. User must own notification.

Response: Updated notification object.

## 16. AI APIs

### 16.1 AI Chat

`POST /v1/ai/chat`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `message` | String | Yes | 1 to 2000 characters. |
| `conversation_id` | UUID | No | Existing conversation. |
| `context_window_days` | Integer | No | 1 to 365, default 90. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `conversation_id` | UUID | Conversation ID. |
| `answer` | String | Grounded AI response. |
| `source_refs` | Array | Transactions, goals, or aggregates referenced. |
| `suggested_actions` | Array | Non-mutating suggested actions. |
| `model_provider` | String | `GEMINI`. |
| `model_name` | String | Gemini model identifier. |
| `confidence` | Decimal | Response confidence. |

Validation:

- AI must not execute payments.
- AI must not expose another user's data.
- Unsupported financial advice must be refused or reframed as educational.

### 16.2 List AI Insights

`GET /v1/ai/insights?type=SPENDING&cursor=<cursor>&limit=20`

Authentication: Bearer JWT.

Response: Insight list with cursor.

### 16.3 Get AI Insight

`GET /v1/ai/insights/{insight_id}`

Authentication: Bearer JWT. User must own insight.

Response: Insight detail.

### 16.4 Generate Insights

`POST /v1/ai/insights/generate`

Authentication: Bearer JWT.

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `insight_types` | Array | No | Allowed insight types. |
| `window_days` | Integer | No | 7 to 365. |

Response:

| Field | Type | Description |
| --- | --- | --- |
| `job_id` | UUID | Async insight generation job. |
| `status` | String | `QUEUED`. |

## 17. Admin APIs

Admin APIs require admin role and audit logging.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/admin/users/{user_id}/initial-balance` | Grant sandbox opening balance through ledger posting. |
| `GET` | `/v1/admin/payments` | Search payments. |
| `GET` | `/v1/admin/ledger/reconciliation` | View ledger reconciliation status. |
| `GET` | `/v1/admin/events/dead-letter` | Inspect dead-letter events. |

## 18. Validation Rules Summary

| Field | Rule |
| --- | --- |
| Mobile number | Valid E.164, normalized before hashing. |
| OTP | 6 numeric digits, limited attempts. |
| Amount | Decimal string, greater than zero, max two fractional digits. |
| Currency | Must be `INR`. |
| UPI ID | Lowercase, valid local part, `@vero` handle. |
| Display name | 2 to 120 characters, normalized whitespace. |
| Note | Max 255 characters, sanitized for display. |
| Idempotency key | 16 to 128 characters, unique per user and operation. |

