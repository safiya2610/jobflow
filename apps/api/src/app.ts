import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './modules/auth/auth.route';
import { jobRoutes } from './modules/jobs/jobs.route';
import { dashboardRoutes } from './modules/dashboard/dashboard.route';
import { executionRoutes } from './modules/executions/executions.route';
import { logRoutes } from './modules/logs/logs.route';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);
