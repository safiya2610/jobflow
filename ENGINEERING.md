# Engineering Document: JobFlow

## Overview

JobFlow is a full-stack web application designed to create, manage, and monitor automated HTTP request jobs. The system allows users to define jobs (manual or scheduled via cron expressions), execute them, and monitor their real-time execution history and system logs.

## Architecture & Stack

While the assignment prompt suggested `.NET/C#` for the backend, I opted to build the backend using **Node.js (Express) and TypeScript** to maintain a unified TypeScript ecosystem across the entire stack. This allows for shared types, a single package manager (npm workspaces), and rapid full-stack iteration.

### Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide React, TanStack React Query.
- **Backend API:** Node.js, Express, TypeScript.
- **Background Worker:** Node.js, cron-parser, Axios.
- **Database:** PostgreSQL (hosted on Neon Serverless Postgres).
- **ORM:** Prisma.
- **Monorepo:** npm workspaces (separated into `apps/web`, `apps/api`, `apps/worker`, `packages/db`).

### Core Components

1. **Web App (`apps/web`)**: A Next.js dashboard providing a premium, responsive UI for managing jobs, viewing execution history, and monitoring system health.
2. **REST API (`apps/api`)**: An Express server exposing CRUD operations for Jobs, Executions, and System Logs, as well as handling user authentication (JWT).
3. **Worker Engine (`apps/worker`)**: A standalone Node.js process split into two distinct roles:
   - **Scheduler (`scheduler.ts`)**: Runs every 10 seconds, polling the database for active jobs with a `cronSchedule` whose `nextRunAt` is due. When found, it queues an `Execution` and updates the `nextRunAt` timestamp.
   - **Executor (`executor.ts`)**: Polls the database for `PENDING` executions using `FOR UPDATE SKIP LOCKED` (Postgres row-level locks) to safely dequeue jobs. It performs the actual HTTP requests, handles retries with exponential backoff, and tracks durations.
4. **Shared DB Package (`packages/db`)**: Contains the Prisma schema and the generated Prisma Client, ensuring type-safe database access across all apps.

## Key Technical Decisions

### 1. Postgres as a Queue (SKIP LOCKED)
Instead of introducing an external message broker like Redis/BullMQ or RabbitMQ, I implemented the job queue directly in PostgreSQL using `SELECT ... FOR UPDATE SKIP LOCKED`. 
- **Why?** It dramatically simplifies the infrastructure (requiring only Postgres), which is ideal for a small-to-medium scale application. `SKIP LOCKED` ensures that multiple concurrent worker instances will never pick up the same execution, guaranteeing exactly-once processing without deadlocks.

### 2. Idempotency Keys
To prevent duplicate job executions (e.g., if a user double-clicks the "Run" button, or if the scheduler accidentally processes the same minute twice), the system relies on idempotency keys. 
- Manual runs generate a UUID UUID sent in the `Idempotency-Key` header.
- Scheduled runs generate a deterministic key based on the Job ID and the execution minute (`cron:{jobId}:{timestampMinute}`).
- The `Execution` table has a unique constraint on `[jobId, idempotencyKey]`, enforcing uniqueness at the database level.

### 3. Comprehensive Execution Tracking & Logging
A core requirement was understanding *what happened when something fails*.
- **Executions:** Every run is tracked. If an HTTP request fails (e.g., 503 Service Unavailable), the worker records the error details, the HTTP status code, and automatically schedules a retry if the job's `retryLimit` allows it.
- **System Logs:** I implemented a dedicated `SystemLog` table. The worker actively writes lifecycle events (`job.queued`, `execution.started`, `http.request`, `execution.failed`, etc.) to this table. The frontend surfaces these in a rich, color-coded Logs dashboard.

## Known Limitations & Future Improvements

1. **Polling Latency:** The worker polls the database for new executions. This introduces a slight latency (up to a few seconds) between queueing a job and its execution. For a production system, converting to a push-based model (e.g., Postgres LISTEN/NOTIFY or a real Redis queue) would provide millisecond latency.
2. **Monolithic DB Pattern:** Currently, system logs are written to the same relational database as the core application data. At extreme scale, logs should be offloaded to a specialized time-series or document database (like Elasticsearch or Datadog) to prevent Postgres bloat.
3. **Authentication:** The current auth implementation uses standard JWTs stored in `localStorage`. In a real production environment, this should be upgraded to use HttpOnly cookies to mitigate XSS vulnerabilities.
4. **Timezones:** Cron parsing currently relies on the server's local timezone. A robust implementation would store the user's preferred timezone against the Job to ensure schedules fire accurately across global regions.
