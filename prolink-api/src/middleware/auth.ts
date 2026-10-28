import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Token requerido');
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error();
    res.locals.userId = payload.sub;
    next();
  } catch {
    throw new AppError(401, 'Token invalido o expirado');
  }
}
