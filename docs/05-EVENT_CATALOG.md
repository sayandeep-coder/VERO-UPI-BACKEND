# VERO AI Event Catalog

## 1. Event System Overview

VERO AI uses RabbitMQ for asynchronous domain events. Events communicate committed business facts, not commands. Each event is immutable, versioned, and published after the owning service commits its database transaction.

## 2. Event Envelope

All events use the same envelope:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `event_id` | UUID | Yes | Unique event identifier. |
| `event_type` | String | Yes | Event name, for example `PAYMENT_COMPLETED`. |
| `event_version` | Integer | Yes | Schema version. |
| `occurred_at` | Timestamp | Yes | Domain occurrence time. |
| `published_at` | Timestamp | Yes | Broker publish time. |
| `correlation_id` | String | Yes | End-to-end request trace ID. |
| `causation_id` | String | No | Command or event that caused this event. |
| `producer` | String | Yes | Publishing service name. |
| `payload` | Object | Yes | Event-specific payload. |

## 3. Delivery Guarantees

| Concern | Strategy |
| --- | --- |
| Publishing | Transactional outbox per publishing service. |
| Delivery | At least once delivery through RabbitMQ. |
| Ordering | Best effort per aggregate key; consumers must tolerate reordering. |
| Idempotency | Consumers store processed `event_id`. |
| Retries | Exponential backoff with dead-letter queue. |
| Schema evolution | Additive changes only within a version; breaking changes require new `event_version`. |

## 4. Retry Strategy Standard

Unless otherwise specified:

- Retry after 5 seconds, 30 seconds, 2 minutes, 10 minutes, and 30 minutes.
- Move to domain dead-letter queue after 5 failed attempts.
- Alert if dead-letter count exceeds threshold.
- Consumers must log event ID, correlation ID, failure class, and retry count.
- Poison messages require manual replay after correction.

## 5. Event: USER_REGISTERED

### Description

Published when a new user is created after OTP verification.

### Publisher

User Service.

### Consumers

- Bank Service creates virtual bank account and UPI ID.
- Notification Service may create welcome notification.
- Analytics Service initializes user aggregates.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | UUID | Yes | New user ID. |
| `display_name` | String | Yes | User display name. |
| `mobile_number_hash` | String | Yes | Hashed mobile identifier. |
| `registration_source` | String | Yes | `MOBILE_APP`, `ADMIN_SEEDED`, `TEST_FIXTURE`. |
| `registered_at` | Timestamp | Yes | User creation time. |

### Retry Strategy

Standard retry. If Bank Service fails after all retries, user remains active but provisioning status is incomplete and a provisioning repair job must retry account creation.

## 6. Event: BANK_ACCOUNT_CREATED

### Description

Published when a virtual bank account is created for a user.

### Publisher

Bank Service.

### Consumers

- Ledger Service initializes ledger account.
- Notification Service informs user.
- Analytics Service initializes balance trend baseline.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | UUID | Yes | Account owner. |
| `bank_account_id` | UUID | Yes | Virtual account ID. |
| `account_number` | String | Yes | Virtual account number. |
| `account_type` | String | Yes | `SAVINGS`, `SYSTEM`, `SUSPENSE`. |
| `currency` | String | Yes | `INR`. |
| `status` | String | Yes | Initial account status. |
| `opened_at` | Timestamp | Yes | Account creation time. |

### Retry Strategy

Standard retry. Ledger Service consumer must be idempotent by `bank_account_id`.

## 7. Event: UPI_ID_CREATED

### Description

Published when a system-generated UPI ID is assigned to a virtual account.

### Publisher

Bank Service.

### Consumers

- Notification Service informs user.
- Payment Service may warm UPI resolution cache.
- Analytics Service may enrich onboarding funnel.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | UUID | Yes | UPI owner. |
| `bank_account_id` | UUID | Yes | Linked account. |
| `upi_id` | String | Yes | Generated UPI ID. |
| `handle` | String | Yes | `vero`. |
| `is_primary` | Boolean | Yes | Primary UPI flag. |
| `created_reason` | String | Yes | `ACCOUNT_OPENING`, `ADMIN_ROTATION`. |
| `created_at` | Timestamp | Yes | Creation time. |

### Retry Strategy

Standard retry. Notification deduplicates by `event_id` or `upi_id`.

## 8. Event: PAYMENT_INITIATED

### Description

Published when Payment Service accepts a payment command and creates a payment record.

### Publisher

Payment Service.

### Consumers

- Transaction Service creates pending transaction rows.
- Notification Service may notify request recipients.
- Fraud hooks can evaluate payment intent.
- Analytics Service updates funnel metrics.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `payment_id` | UUID | Yes | Payment ID. |
| `payment_reference` | String | Yes | External receipt reference. |
| `payment_type` | String | Yes | `SEND`, `REQUEST`, `QR`. |
| `payer_user_id` | UUID | Yes | Payer user ID. |
| `payer_account_id` | UUID | Yes | Payer account ID. |
| `payer_upi_id` | String | Yes | Payer UPI snapshot. |
| `payee_user_id` | UUID | Yes | Payee user ID. |
| `payee_account_id` | UUID | Yes | Payee account ID. |
| `payee_upi_id` | String | Yes | Payee UPI snapshot. |
| `amount` | Decimal | Yes | Payment amount. |
| `currency` | String | Yes | `INR`. |
| `note` | String | No | Payment note. |
| `initiated_at` | Timestamp | Yes | Initiation time. |

### Retry Strategy

Standard retry. Transaction Service must update pending rows idempotently by `payment_id` and user direction.

## 9. Event: PAYMENT_COMPLETED

### Description

Published when a payment reaches terminal successful state after ledger posting.

### Publisher

Payment Service.

### Consumers

- Transaction Service marks payer and payee transactions completed.
- Notification Service notifies payer and payee.
- Analytics Service updates spend aggregates.
- AI Service queues categorization and insight refresh.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `payment_id` | UUID | Yes | Payment ID. |
| `payment_reference` | String | Yes | Receipt reference. |
| `ledger_posting_id` | UUID | Yes | Ledger posting group. |
| `payer_user_id` | UUID | Yes | Payer user ID. |
| `payer_account_id` | UUID | Yes | Payer account ID. |
| `payer_upi_id` | String | Yes | Payer UPI snapshot. |
| `payee_user_id` | UUID | Yes | Payee user ID. |
| `payee_account_id` | UUID | Yes | Payee account ID. |
| `payee_upi_id` | String | Yes | Payee UPI snapshot. |
| `amount` | Decimal | Yes | Amount. |
| `currency` | String | Yes | `INR`. |
| `payment_type` | String | Yes | `SEND`, `REQUEST`, `QR`. |
| `completed_at` | Timestamp | Yes | Completion time. |

### Retry Strategy

Standard retry. Analytics and AI consumers may lag without affecting payment correctness. Notification failures do not reverse payments.

## 10. Event: PAYMENT_FAILED

### Description

Published when a payment reaches terminal failed state.

### Publisher

Payment Service.

### Consumers

- Transaction Service marks pending transaction failed.
- Notification Service informs affected user.
- Analytics Service updates failure metrics.
- Fraud hooks may inspect repeated failures.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `payment_id` | UUID | Yes | Payment ID. |
| `payment_reference` | String | Yes | Receipt reference. |
| `payment_type` | String | Yes | `SEND`, `REQUEST`, `QR`. |
| `payer_user_id` | UUID | Yes | Payer user ID. |
| `payee_user_id` | UUID | No | Payee user ID if resolved. |
| `amount` | Decimal | Yes | Attempted amount. |
| `currency` | String | Yes | `INR`. |
| `failure_code` | String | Yes | Machine-readable failure. |
| `failure_message` | String | Yes | Safe user-facing failure message. |
| `failed_at` | Timestamp | Yes | Failure time. |

### Retry Strategy

Standard retry. Consumers must treat missing payee fields as possible when recipient resolution failed.

## 11. Event: BALANCE_UPDATED

### Description

Published when Ledger Service updates an account balance projection after a successful posting.

### Publisher

Ledger Service.

### Consumers

- Bank Service updates account balance projection.
- Analytics Service updates balance trend.
- Notification Service may notify for large changes in future.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `bank_account_id` | UUID | Yes | Account whose balance changed. |
| `user_id` | UUID | No | User owner for user accounts. |
| `posting_id` | UUID | Yes | Ledger posting group. |
| `ledger_entry_id` | UUID | Yes | Account-specific ledger entry. |
| `previous_balance` | Decimal | Yes | Balance before entry. |
| `new_balance` | Decimal | Yes | Balance after entry. |
| `currency` | String | Yes | `INR`. |
| `ledger_sequence` | Long | Yes | Account ledger sequence. |
| `updated_at` | Timestamp | Yes | Balance update time. |

### Retry Strategy

Standard retry. Consumers should apply only if `ledger_sequence` is newer than their stored sequence.

## 12. Event: GOAL_CREATED

### Description

Published when a user creates or accepts a financial goal.

### Publisher

Analytics Service.

### Consumers

- Notification Service confirms goal creation.
- AI Service uses goal as planning context.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `goal_id` | UUID | Yes | Goal ID. |
| `user_id` | UUID | Yes | Goal owner. |
| `name` | String | Yes | Goal name. |
| `target_amount` | Decimal | Yes | Target amount. |
| `current_amount` | Decimal | Yes | Starting amount. |
| `currency` | String | Yes | `INR`. |
| `target_date` | Date | No | Target date. |
| `source` | String | Yes | `USER`, `AI_RECOMMENDED`, `ADMIN`. |
| `created_at` | Timestamp | Yes | Creation time. |

### Retry Strategy

Standard retry. AI Service can rebuild context from Analytics Service if event is missed and replayed.

## 13. Event: GOAL_COMPLETED

### Description

Published when a goal reaches completed state.

### Publisher

Analytics Service.

### Consumers

- Notification Service celebrates completion.
- AI Service adjusts recommendations.
- Analytics Service downstream aggregate workers update goal metrics.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `goal_id` | UUID | Yes | Goal ID. |
| `user_id` | UUID | Yes | Goal owner. |
| `name` | String | Yes | Goal name. |
| `target_amount` | Decimal | Yes | Target amount. |
| `final_amount` | Decimal | Yes | Amount at completion. |
| `currency` | String | Yes | `INR`. |
| `completed_at` | Timestamp | Yes | Completion time. |

### Retry Strategy

Standard retry. Notification deduplicates by `goal_id` and event type.

## 14. Event: AI_INSIGHT_GENERATED

### Description

Published when AI Service generates a user-visible insight.

### Publisher

AI Service.

### Consumers

- Notification Service creates insight notification.
- Analytics Service links recommendation to goals if accepted later.
- Mobile clients may receive future realtime update through push or WebSocket gateway.

### Payload Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `insight_id` | UUID | Yes | AI insight ID. |
| `user_id` | UUID | Yes | Insight owner. |
| `insight_type` | String | Yes | `SPENDING`, `FORECAST`, `HEALTH_SCORE`, `SUBSCRIPTION`, `GOAL_RECOMMENDATION`, `CHAT_SUMMARY`. |
| `title` | String | Yes | Insight title. |
| `summary` | String | Yes | Short explanation. |
| `severity` | String | Yes | `INFO`, `POSITIVE`, `WARNING`, `CRITICAL`. |
| `confidence` | Decimal | Yes | 0 to 1. |
| `source_refs` | Object | Yes | IDs of transactions, goals, or aggregates used. |
| `model_provider` | String | Yes | `GEMINI`. |
| `model_name` | String | Yes | Gemini model identifier. |
| `prompt_version` | String | Yes | Prompt template version. |
| `generated_at` | Timestamp | Yes | Generation time. |

### Retry Strategy

Standard retry. Notifications may be skipped for low-severity insights based on user preference.

## 15. Event Routing

| Event | Exchange | Routing Key |
| --- | --- | --- |
| `USER_REGISTERED` | `identity.events` | `identity.user.registered` |
| `BANK_ACCOUNT_CREATED` | `banking.events` | `banking.account.created` |
| `UPI_ID_CREATED` | `banking.events` | `banking.upi.created` |
| `PAYMENT_INITIATED` | `payments.events` | `payments.payment.initiated` |
| `PAYMENT_COMPLETED` | `payments.events` | `payments.payment.completed` |
| `PAYMENT_FAILED` | `payments.events` | `payments.payment.failed` |
| `BALANCE_UPDATED` | `ledger.events` | `ledger.balance.updated` |
| `GOAL_CREATED` | `goals.events` | `goals.goal.created` |
| `GOAL_COMPLETED` | `goals.events` | `goals.goal.completed` |
| `AI_INSIGHT_GENERATED` | `ai.events` | `ai.insight.generated` |

## 16. Dead Letter Handling

Each domain has a dead-letter queue:

- `identity.events.dlq`
- `banking.events.dlq`
- `payments.events.dlq`
- `ledger.events.dlq`
- `goals.events.dlq`
- `ai.events.dlq`

Operations must provide:

- Event search by `event_id` and `correlation_id`.
- Replay by event ID.
- Replay by time range.
- DLQ reason classification.
- Consumer idempotency reset for corrected replays.

