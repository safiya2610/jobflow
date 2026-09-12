import { Request, Response, NextFunction } from 'express';
import { prisma } from 'db';
import { NotFoundError } from '../../utils/errors';
import { AuthRequest } from '../../middleware/auth';

export const listJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, description, endpoint, method, headers, payload, cronSchedule, retryLimit, timeoutSeconds } = req.body;

    const job = await prisma.job.create({
      data: {
        userId,
        name,
        description,
        endpoint,
        method,
        headers,
        payload,
        cronSchedule,
        retryLimit,
        timeoutSeconds,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    const job = await prisma.job.update({
      where: { id },
      data: req.body,
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    await prisma.job.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const pauseJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    const job = await prisma.job.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const resumeJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    const job = await prisma.job.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const runJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const idempotencyKey = req.headers['idempotency-key'] as string;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }
    
    if (existingJob.status !== 'ACTIVE') {
      return res.status(400).json({
        error: { code: 'JOB_PAUSED', message: 'Cannot run a paused job' }
      });
    }

    if (idempotencyKey) {
      const existingExecution = await prisma.execution.findUnique({
        where: {
          jobId_idempotencyKey: {
            jobId: id,
            idempotencyKey,
          },
        },
      });

      if (existingExecution) {
        return res.json(existingExecution);
      }
    }

    const execution = await prisma.execution.create({
      data: {
        jobId: id,
        status: 'PENDING',
        idempotencyKey: idempotencyKey || null,
      },
    });

    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        service: 'api',
        event: 'job.queued',
        message: `Execution #${execution.id.substring(0,8)} added to queue via API`,
        context: `executionId:${execution.id}`
      }
    });

    res.status(201).json(execution);
  } catch (error) {
    next(error);
  }
};

// Executions APIs
export const listJobExecutions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const job = await prisma.job.findFirst({ where: { id, userId } });
    if (!job) throw new NotFoundError('Job not found');

    const executions = await prisma.execution.findMany({
      where: { jobId: id },
      orderBy: { queuedAt: 'desc' },
      take: 50,
    });

    res.json(executions);
  } catch (error) {
    next(error);
  }
};
