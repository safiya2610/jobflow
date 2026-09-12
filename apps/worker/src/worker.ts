import { prisma } from 'db';
import { executeJob } from './executor';

export class Worker {
  private workerId: string | null = null;
  private workerName: string;
  private pollIntervalMs: number;
  private isRunning: boolean = false;

  constructor(workerName: string, pollIntervalMs: number = 1000) {
    this.workerName = workerName;
    this.pollIntervalMs = pollIntervalMs;
  }

  async start() {
    this.isRunning = true;
    console.log(`Starting worker: ${this.workerName}`);

    // Register worker
    const worker = await prisma.worker.upsert({
      where: { workerName: this.workerName },
      update: { status: 'ONLINE', lastHeartbeatAt: new Date() },
      create: { workerName: this.workerName, status: 'ONLINE', lastHeartbeatAt: new Date() },
    });
    this.workerId = worker.id;

    this.heartbeatLoop();
    this.pollLoop();
  }

  stop() {
    this.isRunning = false;
  }

  private async heartbeatLoop() {
    while (this.isRunning) {
      if (this.workerId) {
        try {
          await prisma.worker.update({
            where: { id: this.workerId },
            data: { lastHeartbeatAt: new Date(), status: 'ONLINE' },
          });
        } catch (e) {
          console.error('Failed to heartbeat:', e);
        }
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  private async pollLoop() {
    while (this.isRunning) {
      try {
        const execution = await this.claimExecution();
        
        if (execution) {
          console.log(`[${this.workerName}] Claimed execution ${execution.id} for job ${execution.jobId}`);
          await executeJob(execution);
        } else {
          // No jobs found, sleep for the interval
          await new Promise(r => setTimeout(r, this.pollIntervalMs));
        }
      } catch (error) {
        console.error('Error during poll loop:', error);
        await new Promise(r => setTimeout(r, this.pollIntervalMs));
      }
    }
  }

  private async claimExecution() {
    // We use a raw query for SKIP LOCKED since Prisma's built-in locking
    // doesn't support SKIP LOCKED in all scenarios perfectly.
    const executions = await prisma.$queryRaw<any[]>`
      SELECT e.id
      FROM executions e
      WHERE e.status = 'PENDING'
        AND e.queued_at <= NOW()
      ORDER BY e.queued_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1;
    `;

    if (!executions || executions.length === 0) {
      return null;
    }

    const executionId = executions[0].id;

    const claimed = await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'RUNNING',
        workerId: this.workerId,
        lockedAt: new Date(),
        heartbeatAt: new Date(),
      },
      include: { job: true },
    });

    return claimed;
  }
}
