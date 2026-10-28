import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/errors';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72), // 72 bytes: limite real de bcrypt
});
const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

const signToken = (userId: string): string =>
  jwt.sign({}, env.JWT_SECRET, { subject: userId, algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = registerSchema.parse(req.body);
  if (await User.exists({ email })) throw new AppError(409, 'El correo ya esta registrado');
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: signToken(user.id as string), user: { id: user.id, name, email } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select('+passwordHash');
  // Mismo mensaje para usuario inexistente y clave erronea: evita enumeracion de cuentas.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'Credenciales invalidas');
  res.json({ token: signToken(user.id as string), user: { id: user.id, name: user.name, email } });
}
