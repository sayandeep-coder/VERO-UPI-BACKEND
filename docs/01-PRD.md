# VERO AI Product Requirements Document

## 1. Vision

VERO AI is an AI-powered financial operating system built on a sandbox UPI-style payment network. It gives users a realistic payment experience through virtual bank accounts, virtual UPI IDs, internal transfers, double entry accounting, financial goals, and AI-powered money intelligence.

The product is designed to demonstrate production-grade fintech thinking without connecting to NPCI, live banks, card networks, or real funds. Every balance, account, UPI ID, ledger entry, payment, and insight exists inside the VERO sandbox.

## 2. Product Principles

| Principle | Meaning |
| --- | --- |
| Ledger first | Balances are derived from immutable double entry ledger movements, not mutable counters alone. |
| Sandbox realism | User experience should feel like modern UPI apps while remaining explicitly virtual. |
| AI as assistant, not authority | AI explains, summarizes, and recommends. It does not move money or mutate financial records without deterministic service calls. |
| Event driven by default | State changes publish domain events so downstream services can react asynchronously. |
| Clear trust boundaries | Authentication, payment execution, ledger posting, and AI inference have separate ownership boundaries. |
| Auditability | Every money movement, account lifecycle event, and privileged admin action must be reconstructable. |

## 3. Problem Statement

Fintech systems are difficult to understand because real payment networks require bank integrations, compliance programs, settlement systems, and regulated infrastructure. Engineers and product teams often need a safe environment to learn and demonstrate:

- UPI-like account and payment flows.
- Double entry ledger accounting.
- Event-driven financial systems.
- AI-powered personal finance use cases.
- Secure authentication and transaction authorization.
- Operational maturity across observability, failure handling, and deployment.

VERO AI solves this by creating a realistic sandbox financial operating system where users can register, receive a virtual bank account, receive a generated UPI ID, transact internally, and ask AI questions about their finances.

## 4. Goals

### 4.1 Product Goals

- Provide a complete mobile-first sandbox UPI experience.
- Automatically create virtual bank accounts and UPI IDs after registration.
- Support virtual balance holding, send money, request money, QR payments, and transaction history.
- Provide AI features for transaction search, insights, forecasting, health score, subscription detection, and goal recommendations.
- Make the system credible enough for portfolio, demo, and engineering education use cases.

### 4.2 Engineering Goals

- Use service boundaries that mirror real fintech architecture.
- Ensure ledger postings are atomic, immutable, balanced, and idempotent.
- Publish domain events for all major lifecycle and money movement changes.
- Keep AI isolated from payment execution and ledger mutation.
- Provide clear API contracts, event contracts, schema ownership, and deployment strategy.
- Support local development through Docker Compose and production-style deployment through containerized services.

### 4.3 AI Goals

- Use Gemini as the LLM provider.
- Ground AI responses in the user's own sandbox transaction data.
- Produce explainable recommendations with confidence levels and source references.
- Avoid hallucinated financial facts by using structured retrieval and tool outputs.
- Keep sensitive user and transaction data protected through prompt minimization and audit logging.

## 5. Non Goals

- No connection to NPCI, UPI rails, real banks, IMPS, NEFT, RTGS, cards, wallets, or real money.
- No KYC, AML reporting, sanctions screening, chargebacks, real settlement, or dispute arbitration.
- No investment advice, lending, insurance, tax filing, or wealth management execution.
- No AI-initiated payments or balance mutation.
- No third-party merchant onboarding in the initial version.
- No multi-currency support in the initial version.
- No social graph, chat with other users, or public feeds.
- No offline payment mode.

## 6. User Personas

### 6.1 Sandbox Consumer User

- Wants to experience UPI-like payments in a safe demo environment.
- Needs simple registration with mobile number and OTP.
- Values clear balances, payment status, transaction history, and AI explanations.
- Uses goals and insights to understand spending behavior.

### 6.2 Product Evaluator

- Reviews VERO AI as a fintech product and architecture showcase.
- Cares about polished flows, credible domain modeling, failure states, and observability.
- Expects clear documentation and deterministic behavior.

### 6.3 Engineering Recruiter or Interviewer

- Evaluates architectural depth, code organization, event design, database modeling, and reliability practices.
- Looks for service ownership, API consistency, ledger correctness, and AI integration maturity.

### 6.4 Admin Operator

- Controls sandbox initial balances.
- Monitors payment flows, failed events, suspicious activity, and system health.
- Needs audit logs for privileged operations.

## 7. Core Features

### 7.1 Mobile Number OTP Authentication

- Users register and log in using only mobile number and OTP.
- OTPs expire quickly and are rate limited.
- Successful verification issues access and refresh tokens.
- No password, email login, or social login.

### 7.2 Automatic User Provisioning

- After successful first registration, the platform creates:
  - User profile.
  - Virtual bank account.
  - System-generated UPI ID.
  - Optional admin-controlled initial balance ledger posting.

### 7.3 Virtual Bank Account

- Account number is generated internally.
- Account belongs to exactly one user.
- Account has account status, balance view, and ledger-backed transaction history.
- Account does not represent a real bank account.

### 7.4 Virtual UPI ID

- UPI ID is generated by the system using normalized user name and account suffix.
- Example: `sayandeep0001@vero`.
- UPI ID maps to one active bank account.
- Users cannot manually pick arbitrary UPI IDs in the initial version.

### 7.5 Send Money

- Sender enters recipient UPI ID, amount, and optional note.
- Payment Service validates sender, receiver, account status, limits, idempotency, and balance.
- Ledger Service posts atomic debit and credit entries.
- Transaction Service records user-visible transaction rows.
- Notifications are sent to sender and receiver.

### 7.6 Request Money

- Requester creates a collect request to another UPI ID.
- Payer can approve or decline.
- Approval creates a payment using the same ledger posting path as send money.
- Expired requests cannot be paid.

### 7.7 Scan QR

- QR encodes payment intent data such as payee UPI ID, amount, note, and reference.
- Mobile app parses QR and opens confirmation screen.
- Payment execution revalidates all QR data server-side.

### 7.8 Transaction History

- Users can view debits, credits, failed payments, pending requests, and AI-enriched categories.
- Transaction records are immutable snapshots for user display.
- Ledger remains the accounting source of truth.

### 7.9 Goals

- Users can create savings goals with target amount and due date.
- Goal progress is calculated from allocated virtual funds or spending behavior, depending on product mode.
- AI can recommend goals based on historical transactions and recurring patterns.

### 7.10 Notifications

- Notify users for account creation, UPI ID creation, payment status, request money updates, goal milestones, and AI insights.
- Initial channels are in-app notifications; SMS or push can be added later.

## 8. AI Features

### 8.1 Transaction Search

Users can ask natural language questions:

- "Show my food spends last month."
- "Find payments to Priya above INR 500."
- "When did I pay for Netflix?"

The AI Service converts intent into structured filters, queries transaction data through internal APIs, and returns grounded results.

### 8.2 Spending Insights

- Category-level spend summaries.
- Week-over-week and month-over-month changes.
- Largest merchants or counterparties.
- Unusual spend detection.
- Plain-language explanations.

### 8.3 Financial Health Score

Score combines:

- Spending stability.
- Savings goal progress.
- Recurring obligation load.
- Balance trend.
- Payment failure frequency.
- Category concentration.

Score must be explainable and must not imply regulated creditworthiness.

### 8.4 Subscription Detection

- Detect recurring payments by counterparty, amount, cadence, and description.
- Classify likely subscriptions.
- Surface next expected charge date and confidence.

### 8.5 Spending Forecasting

- Forecast future spend by category and total outflow.
- Use statistical time-series logic first, with Gemini used to explain results.
- Display confidence bands and assumptions.

### 8.6 Goal Recommendations

- Recommend realistic goal amounts and timelines.
- Suggest goal contributions based on past spending and forecasted balance.
- Explain tradeoffs in simple language.

## 9. Functional Requirements

| Area | Requirement |
| --- | --- |
| Registration | Mobile number and OTP are mandatory. |
| User identity | One active user per verified mobile number. |
| Account creation | Bank account is automatically generated after first registration. |
| UPI ID creation | UPI ID is generated using name and account number suffix. |
| Balance | Balance is derived from ledger postings and exposed as a read model. |
| Payments | Internal transfers support pending, completed, and failed states. |
| Ledger | Every completed payment creates balanced debit and credit entries. |
| Idempotency | Mutating payment APIs require idempotency keys. |
| AI | AI answers must be grounded in retrieved user data. |
| Admin | Admin can assign initial virtual balance through controlled ledger postings. |

## 10. Non Functional Requirements

| Category | Requirement |
| --- | --- |
| Availability | Core read APIs target 99.9 percent uptime in production. |
| Consistency | Ledger postings require strong consistency. Analytics and AI insights can be eventually consistent. |
| Latency | Payment confirmation p95 under 800 ms in normal load for sandbox production. |
| Durability | Ledger entries and payment state transitions must be durable before events are acknowledged. |
| Security | PII and tokens must be encrypted or hashed according to data class. |
| Audit | All auth, payment, ledger, admin, and AI access events must be traceable. |
| Observability | Services emit metrics, structured logs, distributed traces, and domain-level counters. |
| Scalability | Services scale horizontally except PostgreSQL primary write path. |

## 11. Success Metrics

### 11.1 Product Metrics

- Registration completion rate.
- Account provisioning success rate.
- First payment completion rate.
- Payment success rate.
- Monthly active users in sandbox.
- AI feature adoption rate.
- Goal creation rate.
- User retention after first AI insight.

### 11.2 Reliability Metrics

- Payment p50, p95, and p99 latency.
- Ledger posting failure rate.
- Event publish and consume lag.
- OTP send and verification success rate.
- API error rate by endpoint.
- Queue dead-letter volume.
- AI timeout and fallback rate.

### 11.3 AI Quality Metrics

- Grounded response rate.
- User helpfulness rating.
- Unsupported question deflection rate.
- Insight freshness.
- Categorization precision and recall.
- Subscription detection precision and recall.

## 12. MVP Scope

| Included | Deferred |
| --- | --- |
| Mobile OTP auth | Real SMS provider redundancy |
| Auto account and UPI ID creation | User-selected UPI aliases |
| Internal send money | External bank transfers |
| Request money | Merchant collect flows |
| QR payment intent | Dynamic merchant QR infrastructure |
| Double entry ledger | Settlement batches |
| Transaction history | Disputes |
| Goals | Multi-user shared goals |
| Gemini-powered insights | Fine-tuned domain model |

## 13. Future Roadmap

### Phase 1: Sandbox Core

- OTP authentication.
- Auto account provisioning.
- UPI ID generation.
- Internal send money and request money.
- Ledger-backed balances.
- Transaction history.

### Phase 2: AI Financial OS

- Gemini chat over transactions.
- Category insights.
- Financial health score.
- Subscription detection.
- Forecasting.
- Goal recommendations.

### Phase 3: Platform Maturity

- Admin console.
- Event replay tooling.
- Ledger reconciliation dashboards.
- Fraud simulation rules.
- Push notifications.
- Advanced observability.

### Phase 4: Ecosystem Simulation

- Virtual merchants.
- Merchant QR generation.
- Sandbox webhooks.
- Developer API keys.
- Simulated settlement reports.

## 14. Open Product Decisions

| Decision | Recommended Default |
| --- | --- |
| Initial balance amount | Admin configurable per user or campaign. |
| Transaction limits | Daily and per-transaction sandbox limits. |
| Goal contribution model | Start with tracking-only goals, later add virtual allocation. |
| Notification channels | Start in-app, later push and SMS. |
| AI chat memory | Session memory first, durable memory only after privacy review. |

