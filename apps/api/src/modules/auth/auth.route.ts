import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { validateRequest } from '../../middleware/validation';
import { requireAuth } from '../../middleware/auth';
import { RegisterSchema, LoginSchema } from 'validation';

export const authRoutes = Router();

authRoutes.post('/register', validateRequest(RegisterSchema), register);
authRoutes.post('/login', validateRequest(LoginSchema), login);
authRoutes.get('/me', requireAuth, getMe);
