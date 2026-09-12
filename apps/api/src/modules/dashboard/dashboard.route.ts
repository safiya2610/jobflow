import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getDashboardStats } from './dashboard.controller';

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);

dashboardRoutes.get('/stats', getDashboardStats);
