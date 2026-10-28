const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export function formatCOP(value: number): string {
  return COP.format(Math.round(value || 0));
}

export function formatNumber(value: number): string {
  return NUMBER.format(Math.round(value || 0));
}

export function parseAmountInput(value: string): number {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

export function formatAmountInput(value: number): string {
  return value > 0 ? NUMBER.format(value) : '';
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'PL';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function currentMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(month: string): string {
  const [year, m] = month.split('-');
  const index = Number(m) - 1;
  const label = MONTHS[index] ?? month;
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return currentMonth(date);
}

export function isCurrentMonth(month: string): boolean {
  return month === currentMonth();
}

export function formatDate(iso: string, opts?: { short?: boolean }): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  if (opts?.short) {
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function dayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, today)) return 'Hoy';
  if (sameDay(date, yesterday)) return 'Ayer';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Fecha de hoy al mediodia, en ISO, para que el mes no cambie por zona horaria. */
export function todayAtNoonIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).toISOString();
}

export function isoToInputDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

/** Acepta DD/MM/AAAA y devuelve ISO al mediodia local. */
export function inputDateToIso(value: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date.toISOString();
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
