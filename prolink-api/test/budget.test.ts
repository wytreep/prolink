import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSummary, computeTargets, monthRange } from '../src/services/budget.service';

test('metas 50/30/20 suman exactamente el ingreso (ingreso impar)', () => {
  const t = computeTargets(1_300_001);
  assert.equal(t.needs + t.wants + t.savings, 1_300_001);
  assert.equal(t.needs, 650_000);
  assert.equal(t.wants, 390_000);
  assert.equal(t.savings, 260_001);
});

test('estados ok / warning / exceeded', () => {
  const s = buildSummary(1_000_000, { needs: 300_000, wants: 240_000, savings: 250_000 });
  assert.deepEqual(s.map((b) => b.status), ['ok', 'warning', 'exceeded']);
  assert.equal(s[1]?.usedPct, 80);
});

test('sin ingresos y con gasto => exceeded, sin division por cero', () => {
  const s = buildSummary(0, { needs: 5000, wants: 0, savings: 0 });
  assert.equal(s[0]?.status, 'exceeded');
  assert.equal(s[1]?.usedPct, 0);
});

test('rango mensual en hora Colombia, incluido diciembre', () => {
  const r = monthRange('2026-12');
  assert.equal(r.start.toISOString(), '2026-12-01T05:00:00.000Z');
  assert.equal(r.end.toISOString(), '2027-01-01T05:00:00.000Z');
  assert.throws(() => monthRange('2026-13'), RangeError);
});
