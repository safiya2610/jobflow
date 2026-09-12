import { prisma } from 'db';

export const startRecoveryLoop = () => {
  const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

  const loop = async () => {
    try {
      const staleDate = new Date(Date.now() - STALE_THRESHOLD_MS);

      const staleExecutions = await prisma.execution.findMany({
        where: {
          status: 'RUNNING',
          heartbeatAt: {
            lt: staleDate,
          },
        },
        include: { job: true },
      });

      for (const execution of staleExecutions) {
        console.log(`[Recovery] Recovering stale execution ${execution.id}`);

        const attempt = execution.attemptNumber;
        const limit = execution.job.retryLimit;

        if (attempt <= limit) {
          // Requeue it as PENDING
          await prisma.execution.update({
            where: { id: execution.id },
            data: {
              status: 'PENDING',
              workerId: null,
              lockedAt: null,
              heartbeatAt: null,
              errorDetails: 'Worker crashed or timed out (stale heartbeat recovery)',
            },
          });
        } else {
          // Mark as FAILED
          await prisma.execution.update({
            where: { id: execution.id },
            data: {
              status: 'FAILED',
              workerId: null,
              lockedAt: null,
              heartbeatAt: null,
              errorDetails: 'Worker crashed or timed out (max retries reached)',
              completedAt: new Date(),
            },
          });
        }
      }
    } catch (error) {
      console.error('[Recovery] Error in recovery loop:', error);
    }

    setTimeout(loop, 60000); // Check every minute
  };

  loop();
};
