import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Transaction, type Bucket } from '../models/Transaction';
import { buildSummary, monthRange } from '../services/budget.service';

const txInput = z
  .object({
    clientId: z.string().uuid(),
    type: z.enum(['income', 'expense']),
    bucket: z.enum(['needs', 'wants', 'savings']).optional(),
    amountCop: z.number().int().positive().max(10_000_000_000),
    description: z.string().trim().min(1).max(120),
    date: z.coerce.date(),
  })
  .refine((t) => (t.type === 'expense' ? t.bucket !== undefined : t.bucket === undefined), {
    message: 'Los gastos requieren bucket; los ingresos no lo admiten',
    path: ['bucket'],
  });

const batchInput = z.object({ transactions: z.array(txInput).min(1).max(100) });
const monthQuery = z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) });

const uid = (res: Response): Types.ObjectId => new Types.ObjectId(res.locals.userId as string);

/** Sync offline: upsert idempotente por (userId, clientId); reintentos no duplican registros. */
export async function syncTransactions(req: Request, res: Response): Promise<void> {
  const { transactions } = batchInput.parse(req.body);
  const userId = uid(res);
  const result = await Transaction.bulkWrite(
    transactions.map((t) => ({
      updateOne: {
        filter: { userId, clientId: t.clientId },
        update: { $setOnInsert: { ...t, userId } },
        upsert: true,
      },
    })),
    { ordered: false },
  );
  res.status(200).json({ received: transactions.length, created: result.upsertedCount, duplicates: transactions.length - result.upsertedCount });
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const t = txInput.parse(req.body);
  const userId = uid(res);
  const doc = await Transaction.findOneAndUpdate(
    { userId, clientId: t.clientId },
    { $setOnInsert: { ...t, userId } },
    { upsert: true, new: true },
  );
  res.status(201).json(doc);
}

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const { month } = monthQuery.parse(req.query);
  const { start, end } = monthRange(month);
  const items = await Transaction.find({ userId: uid(res), date: { $gte: start, $lt: end } }).sort({ date: -1 }).limit(500).lean();
  res.json({ month, items });
}

export async function monthlySummary(req: Request, res: Response): Promise<void> {
  const { month } = monthQuery.parse(req.query);
  const { start, end } = monthRange(month);
  const rows = await Transaction.aggregate<{ _id: { type: string; bucket?: Bucket }; total: number }>([
    { $match: { userId: uid(res), date: { $gte: start, $lt: end } } },
    { $group: { _id: { type: '$type', bucket: '$bucket' }, total: { $sum: '$amountCop' } } },
  ]);
  const spent: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 };
  let incomeCop = 0;
  for (const r of rows) {
    if (r._id.type === 'income') incomeCop += r.total;
    else if (r._id.bucket) spent[r._id.bucket] += r.total;
  }
  res.json({ month, incomeCop, buckets: buildSummary(incomeCop, spent) });
}
