import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { CreateJobSchema, UpdateJobSchema } from 'validation';
import {
  listJobs,
  createJob,
  getJob,
  updateJob,
  deleteJob,
  pauseJob,
  resumeJob,
  runJob,
  listJobExecutions
} from './jobs.controller';

export const jobRoutes = Router();

jobRoutes.use(requireAuth);

jobRoutes.get('/', listJobs);
jobRoutes.post('/', validateRequest(CreateJobSchema), createJob);
jobRoutes.get('/:id', getJob);
jobRoutes.patch('/:id', validateRequest(UpdateJobSchema), updateJob);
jobRoutes.delete('/:id', deleteJob);

jobRoutes.post('/:id/pause', pauseJob);
jobRoutes.post('/:id/resume', resumeJob);
jobRoutes.post('/:id/run', runJob);

jobRoutes.get('/:id/executions', listJobExecutions);
