/**
 * Logica pura de la regla 50/30/20 (sin dependencias de BD) para poder probarla
 * de forma aislada y reutilizarla luego en el cliente offline.
 */
export type Bucket = 'needs' | 'wants' | 'savings';
export type BucketStatus = 'ok' | 'warning' | 'exceeded';

export const RULE: Record<Bucket, number> = { needs: 50, wants: 30, savings: 20 };
export const WARNING_THRESHOLD_PCT = 80;

export interface BucketSummary {
  bucket: Bucket;
  targetCop: number;
  spentCop: number;
  remainingCop: number;
  usedPct: number;
  status: BucketStatus;
}

/** Calcula metas por categoria; el ahorro absorbe el residuo del redondeo (suma exacta = ingreso). */
export function computeTargets(incomeCop: number): Record<Bucket, number> {
  const needs = Math.floor((incomeCop * RULE.needs) / 100);
  const wants = Math.floor((incomeCop * RULE.wants) / 100);
  return { needs, wants, savings: incomeCop - needs - wants };
}

export function buildSummary(
  incomeCop: number,
  spent: Record<Bucket, number>,
): BucketSummary[] {
  const targets = computeTargets(incomeCop);
  return (Object.keys(RULE) as Bucket[]).map((bucket) => {
    const targetCop = targets[bucket];
    const spentCop = spent[bucket];
    const usedPct = targetCop === 0 ? (spentCop > 0 ? 100 : 0) : Math.round((spentCop * 1000) / targetCop) / 10;
    const status: BucketStatus =
      spentCop > targetCop ? 'exceeded' : usedPct >= WARNING_THRESHOLD_PCT ? 'warning' : 'ok';
    return { bucket, targetCop, spentCop, remainingCop: targetCop - spentCop, usedPct, status };
  });
}

/** Rango [inicio, fin) del mes en hora de Colombia (UTC-5, sin horario de verano). */
export function monthRange(month: string): { start: Date; end: Date } {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!m) throw new RangeError('Formato de mes invalido, use YYYY-MM');
  const year = Number(m[1]);
  const mon = Number(m[2]);
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMon = mon === 12 ? 1 : mon + 1;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return {
    start: new Date(`${year}-${pad(mon)}-01T00:00:00-05:00`),
    end: new Date(`${nextYear}-${pad(nextMon)}-01T00:00:00-05:00`),
  };
}
