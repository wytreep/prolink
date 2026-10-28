import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { createTransaction, listTransactions, monthlySummary, syncTransactions } from '../controllers/finance.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const api = Router();

api.get('/health', (_req, res) => res.json({ status: 'ok' }));
api.post('/auth/register', asyncHandler(register));
api.post('/auth/login', asyncHandler(login));

// Modulo Finanzas (EPIC-07) - todas las rutas protegidas
api.use('/finance', requireAuth);
api.post('/finance/transactions', asyncHandler(createTransaction));
api.post('/finance/transactions/sync', asyncHandler(syncTransactions));
api.get('/finance/transactions', asyncHandler(listTransactions));
api.get('/finance/summary', asyncHandler(monthlySummary));
