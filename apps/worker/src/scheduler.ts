import { prisma } from 'db';
import parser from 'cron-parser';

export const startSchedulerLoop = () => {
  const loop = async () => {
    try {
      const now = new Date();

      // Find jobs due for scheduling.
      // Use SKIP LOCKED to avoid multiple schedulers duplicating work.
      const jobs = await prisma.$queryRaw<any[]>`
        SELECT id, name, cron_schedule
        FROM jobs
        WHERE status = 'ACTIVE'
          AND next_run_at <= NOW()
          AND cron_schedule IS NOT NULL
        FOR UPDATE SKIP LOCKED
      `;

      for (const rawJob of jobs) {
        try {
          const schedule = parser.parse(rawJob.cron_schedule);
          const nextRunAt = schedule.next().toDate();
          
          // Current scheduled time string for idempotency
          // We assume the time it was *due* is based on its previous next_run_at.
          // Since we might not have the exact due time easily accessible here without more complex queries,
          // we use a timestamp rounded to the nearest minute to prevent duplicates if scheduler runs twice in the same minute.
          const timestampMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).toISOString();
          const idempotencyKey = `cron:${rawJob.id}:${timestampMinute}`;

          await prisma.$transaction(async (tx) => {
            // Check idempotency just in case
            const existing = await tx.execution.findUnique({
              where: {
                jobId_idempotencyKey: {
                  jobId: rawJob.id,
                  idempotencyKey,
                },
              },
            });

            if (!existing) {
              await tx.execution.create({
                data: {
                  jobId: rawJob.id,
                  status: 'PENDING',
                  idempotencyKey,
                },
              });

              await tx.systemLog.create({
                data: {
                  level: 'INFO',
                  service: 'scheduler',
                  event: 'schedule.triggered',
                  message: `Triggered schedule for job "${rawJob.name || rawJob.id}"`,
                  context: `jobId:${rawJob.id}`
                }
              });
            }

            // Update job's next_run_at
            await tx.job.update({
              where: { id: rawJob.id },
              data: { nextRunAt },
            });
          });

          console.log(`[Scheduler] Scheduled job ${rawJob.id}, next run at ${nextRunAt}`);
        } catch (e) {
          console.error(`[Scheduler] Failed to schedule job ${rawJob.id}:`, e);
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error in scheduler loop:', error);
    }

    setTimeout(loop, 10000); // Check every 10 seconds
  };

  loop();
};
