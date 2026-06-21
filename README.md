# VERO-UPI-BACKEND
# VERO2026 Backend

Production-shaped backend foundation for the VERO2026 AI-powered UPI sandbox platform.

## Stack

- Node.js, TypeScript, Express
- pnpm workspaces and Turborepo
- Prisma Client with an existing Neon PostgreSQL schema
- Redis
- RabbitMQ
- Docker Compose for local infrastructure

## Important Database Rule

The Neon PostgreSQL tables are assumed to already exist. This repository contains Prisma models and query/repository layers only.

Do not add Prisma migrations, SQL migration files, seed scripts, or table creation scripts unless the database strategy changes explicitly.

## Workspace Layout

```text
apps/
  api-gateway/
  auth-service/
  user-service/
  bank-service/
  ledger-service/
  payment-service/
  transaction-service/
  analytics-service/
  notification-service/
  ai-service/

packages/
  shared-auth/
  shared-config/
  shared-database/
  shared-errors/
  shared-events/
  shared-http/
  shared-logger/
  shared-rabbitmq/
  shared-redis/
  shared-types/
  shared-validation/
```

Each service follows the same production-oriented structure:

```text
src/
  api/
  application/
  domain/
  infrastructure/
  config/
  constants/
  types/
```

Controllers validate and return HTTP responses. Application services own use-case behavior. Domain folders define repository contracts and entities. Infrastructure folders adapt Prisma, Redis, RabbitMQ, or external providers.

## Current Implemented Foundation

- Prisma models for `users`, `user_devices`, and `user_sessions`.
- Shared Prisma client and repository/query layers.
- Auth token refresh and logout flow using `user_sessions`.
- User profile read flow using clean architecture boundaries.
- Standard HTTP bootstrap with health checks, request IDs, security middleware, and error envelope.
- Per-service `.env` files for independent deployment readiness.

## Local Infrastructure

```bash
docker compose up -d postgres redis rabbitmq
```

## Common Commands

```bash
pnpm install
pnpm prisma:generate
pnpm typecheck
pnpm dev
```
