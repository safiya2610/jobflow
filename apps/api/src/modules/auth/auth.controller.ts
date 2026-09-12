import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'db';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
