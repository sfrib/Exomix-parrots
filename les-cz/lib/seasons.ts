import type { Season } from './types';

export const SEASONS: Season[] = ['jaro', 'leto', 'podzim', 'zima'];

export const SEASON_LABEL: Record<Season, string> = {
  jaro: 'Jaro',
  leto: 'Léto',
  podzim: 'Podzim',
  zima: 'Zima',
};

export const SEASON_MONTHS: Record<Season, number[]> = {
  jaro: [3, 4, 5],
  leto: [6, 7, 8],
  podzim: [9, 10, 11],
  zima: [12, 1, 2],
};

export const MONTH_NAMES = [
  'leden',
  'únor',
  'březen',
  'duben',
  'květen',
  'červen',
  'červenec',
  'srpen',
  'září',
  'říjen',
  'listopad',
  'prosinec',
];

export const MONTH_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];

/** Měsíc 1–12 → roční období (meteorologicky). */
export function seasonOfMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'jaro';
  if (month >= 6 && month <= 8) return 'leto';
  if (month >= 9 && month <= 11) return 'podzim';
  return 'zima';
}

export function currentMonth(date: Date = new Date()): number {
  return date.getMonth() + 1;
}

export function isSeason(value: string): value is Season {
  return (SEASONS as string[]).includes(value);
}

/** Lidsky čitelný rozsah měsíců, např. „červen–srpen“ nebo „celoročně“. */
export function formatMonths(months: number[]): string {
  if (months.length === 0) return '—';
  if (months.length === 12) return 'celoročně';
  const sorted = [...months].sort((x, y) => x - y);
  // Najdi souvislé úseky s ohledem na přechod prosinec → leden.
  const set = new Set(sorted);
  const starts = sorted.filter((m) => !set.has(m === 1 ? 12 : m - 1));
  if (starts.length === 0) return 'celoročně';
  const ranges = starts.map((start) => {
    let end = start;
    while (set.has(end === 12 ? 1 : end + 1) && (end === 12 ? 1 : end + 1) !== start) {
      end = end === 12 ? 1 : end + 1;
    }
    return start === end ? MONTH_NAMES[start - 1] : `${MONTH_NAMES[start - 1]}–${MONTH_NAMES[end - 1]}`;
  });
  return ranges.join(', ');
}
