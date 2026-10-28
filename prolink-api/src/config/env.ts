import 'dotenv/config';
import { z } from 'zod';

/** Validacion fail-fast de variables de entorno: la app no arranca con config insegura. */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1h'),
});

export const env = schema.parse(process.env);
