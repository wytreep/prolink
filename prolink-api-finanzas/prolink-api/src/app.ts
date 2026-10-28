import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/errorHandler';
import { api } from './routes';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors()); // Apps nativas no usan CORS; restringir origenes si se agrega cliente web.
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
// Limite mas estricto en autenticacion (fuerza bruta).
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }));
app.use('/api/v1', api);
app.use(notFound);
app.use(errorHandler);
