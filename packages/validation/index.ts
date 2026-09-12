import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateJobSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  headers: z.record(z.string()).optional(),
  payload: z.string().optional(),
  cronSchedule: z.string().optional(),
  retryLimit: z.number().min(0).max(5).default(0),
  timeoutSeconds: z.number().min(1).max(120).default(30),
});

export const UpdateJobSchema = CreateJobSchema.partial();
