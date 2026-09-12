import { Request, Response, NextFunction } from 'express';
import { prisma } from 'db';

export const listLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // limit to 100 for now
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
