import { Request, Response, NextFunction } from 'express';
import { prisma } from 'db';
import { AuthRequest } from '../../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const totalJobs = await prisma.job.count({ where: { userId } });
    const activeJobs = await prisma.job.count({ where: { userId, status: 'ACTIVE' } });
    
    // For execution stats, we need to join across job.userId
    const successfulExecutions = await prisma.execution.count({
      where: { job: { userId }, status: 'SUCCESS' }
    });
    
    const failedExecutions = await prisma.execution.count({
      where: { job: { userId }, status: 'FAILED' }
    });

    const recentExecutions = await prisma.execution.findMany({
      where: { job: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        job: { select: { name: true, type: true } }
      }
    });

    const workers = await prisma.worker.findMany({
      orderBy: { workerName: 'asc' },
    });

    res.json({
      stats: {
        totalJobs,
        activeJobs,
        successfulExecutions,
        failedExecutions,
      },
      recentExecutions,
      workers,
    });
  } catch (error) {
    next(error);
  }
};
