# JobFlow

JobFlow is a Job Automation & Execution Platform demonstrating a highly reliable, concurrent worker architecture backed by PostgreSQL. 

It handles creating HTTP jobs, scheduling them, and executing them with full support for retries, exponential backoff, worker concurrency control, and stale execution recovery.

## Features
- **Monorepo Architecture**: Clean separation of `api`, `worker`, `web`, and shared `db`/`validation` packages.
- **Concurrent Workers**: Multiple workers can safely pull from the same queue without duplicate execution using PostgreSQL `FOR UPDATE SKIP LOCKED`.
- **Robust Retries**: Built-in exponential backoff for retryable HTTP failures (429, 503, 504, etc).
- **Stale Worker Recovery**: Heartbeat system detects crashed workers and automatically requeues their running executions.
- **Idempotency**: Prevents duplicate manual triggers or scheduler runs using idempotency keys.
- **Execution Tracking**: Full timeline and status visibility for every execution attempt.

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS, TanStack Query
- **Backend API**: Node.js, Express, TypeScript, Zod
- **Worker**: Standalone Node.js process
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest, Supertest

## Running Locally

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (or Docker)

### 2. Setup Database
If you have Docker installed:
```bash
docker-compose up -d
```
Otherwise, ensure PostgreSQL is running locally and update `DATABASE_URL` in `.env`.

### 3. Install & Migrate
```bash
npm install
npm run db:push
npm run db:generate
```

### 4. Start Services
Open three terminals and run:
```bash
npm run dev:api     # Starts API on port 3001
npm run dev:worker  # Starts the worker process
npm run dev:web     # Starts Next.js on port 3000
```

### Running Multiple Workers
You can start multiple independent worker processes to observe concurrency:
```bash
WORKER_NAME=worker-02 npm run dev:worker
WORKER_NAME=worker-03 npm run dev:worker
```

## Known Limitations
- External APIs can still produce duplicate side effects after worker crashes. JobFlow guarantees exactly one worker at a time per execution, but external systems must support idempotency.
- PostgreSQL acts as the queue. Extremely high throughput might warrant a dedicated broker like Redis/RabbitMQ, but Postgres suffices for this scale and provides strong transactionality.
- Polling is used for frontend real-time updates rather than WebSockets, prioritizing simplicity for this assignment.
