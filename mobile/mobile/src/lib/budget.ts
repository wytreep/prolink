import type { Bucket, BucketStatus, BucketSummary, FinanceSummary, Transaction } from '@/types';

export const RULE: Record<Bucket, number> = { needs: 50, wants: 30, savings: 20 };
export const WARNING_THRESHOLD_PCT = 80;

/** Misma regla del backend: el ahorro absorbe el residuo para que las metas sumen el ingreso. */
export function computeTargets(incomeCop: number): Record<Bucket, number> {
  const needs = Math.floor((incomeCop * RULE.needs) / 100);
  const wants = Math.floor((incomeCop * RULE.wants) / 100);
  return { needs, wants, savings: incomeCop - needs - wants };
}

export function statusFor(spentCop: number, targetCop: number, usedPct: number): BucketStatus {
  if (spentCop > targetCop) return 'exceeded';
  if (usedPct >= WARNING_THRESHOLD_PCT) return 'warning';
  return 'ok';
}

export function buildSummary(incomeCop: number, spent: Record<Bucket, number>): BucketSummary[] {
  const targets = computeTargets(incomeCop);
  return (['needs', 'wants', 'savings'] as Bucket[]).map((bucket) => {
    const targetCop = targets[bucket];
    const spentCop = spent[bucket];
    const usedPct =
      targetCop === 0 ? (spentCop > 0 ? 100 : 0) : Math.round((spentCop * 1000) / targetCop) / 10;
    return {
      bucket,
      targetCop,
      spentCop,
      remainingCop: targetCop - spentCop,
      usedPct,
      status: statusFor(spentCop, targetCop, usedPct),
    };
  });
}

/** Resumen local del mes: funciona sin conexion y refleja los movimientos pendientes. */
export function buildLocalSummary(month: string, transactions: Transaction[]): FinanceSummary {
  const inMonth = transactions.filter((tx) => tx.date.slice(0, 7) === month);
  let incomeCop = 0;
  const spent: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 };
  for (const tx of inMonth) {
    if (tx.type === 'income') incomeCop += tx.amountCop;
    else if (tx.bucket) spent[tx.bucket] += tx.amountCop;
  }
  const buckets = buildSummary(incomeCop, spent);
  const totalSpentCop = buckets.reduce((sum, bucket) => sum + bucket.spentCop, 0);
  return {
    month,
    incomeCop,
    buckets,
    totalSpentCop,
    balanceCop: incomeCop - totalSpentCop,
  };
}
