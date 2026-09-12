import { Request, Response, NextFunction } from 'express';
import { prisma } from 'db';
import { NotFoundError } from '../../utils/errors';
import { AuthRequest } from '../../middleware/auth';

export const listExecutions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // Get all executions that belong to any job owned by the user
    const executions = await prisma.execution.findMany({
      where: {
        job: {
          userId: userId
        }
      },
      include: {
        job: {
          select: {
            name: true,
            cronSchedule: true
          }
        }
      },
      orderBy: {
        queuedAt: 'desc'
      },
      take: 50 // limit for now
    });

    res.json(executions);
  } catch (error) {
    next(error);
  }
};

export const getExecution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const execution = await prisma.execution.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!execution || execution.job.userId !== userId) {
      throw new NotFoundError('Execution not found');
    }

    res.json(execution);
  } catch (error) {
    next(error);
  }
};

export const retryExecution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const execution = await prisma.execution.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!execution || execution.job.userId !== userId) {
      throw new NotFoundError('Execution not found');
    }

    if (execution.status !== 'FAILED') {
      return res.status(400).json({
        error: { code: 'INVALID_STATE', message: 'Only failed executions can be retried' }
      });
    }

    const newExecution = await prisma.execution.create({
      data: {
        jobId: execution.jobId,
        status: 'PENDING',
        attemptNumber: execution.attemptNumber + 1,
      },
    });

    res.status(201).json(newExecution);
  } catch (error) {
    next(error);
  }
};
