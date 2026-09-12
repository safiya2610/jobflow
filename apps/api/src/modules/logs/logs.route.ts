import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { listLogs } from './logs.controller';

export const logRoutes = Router();

logRoutes.use(requireAuth);

logRoutes.get('/', listLogs);
