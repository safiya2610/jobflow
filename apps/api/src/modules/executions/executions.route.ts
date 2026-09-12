import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getExecution, retryExecution, listExecutions } from './executions.controller';

export const executionRoutes = Router();

executionRoutes.use(requireAuth);

executionRoutes.get('/', listExecutions);
executionRoutes.get('/:id', getExecution);
executionRoutes.post('/:id/retry', retryExecution);
