import { MONTH_NAMES, MONTH_SHORT } from '@/lib/seasons';

/** Vizuální kalendář sběru – 12 měsíců, zvýrazněné měsíce „naskladnění“. */
export default function MonthBar({ months, risky = false }: { months: number[]; risky?: boolean }) {
  return (
    <ol className="grid grid-cols-12 gap-1" aria-label="Kalendář dostupnosti">
      {MONTH_SHORT.map((m, i) => {
        const active = months.includes(i + 1);
        return (
          <li
            key={m}
            title={`${MONTH_NAMES[i]}: ${active ? (risky ? 'nejvíce nápadné / největší riziko' : 'naskladněno') : 'mimo sezónu'}`}
            className={`rounded-md py-1.5 text-center text-[10px] font-semibold uppercase sm:text-[11px] ${
              active ? (risky ? 'bg-berry-600 text-white' : 'bg-forest-600 text-white') : 'bg-sand-200 text-ink/45'
            }`}
          >
            <span aria-hidden="true">{m}</span>
            <span className="sr-only">
              {MONTH_NAMES[i]} {active ? '– ano' : '– ne'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
