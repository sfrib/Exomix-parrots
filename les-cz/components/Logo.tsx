interface Props {
  className?: string;
  /** Jen značka (pro malé plochy a sociální sítě). */
  markOnly?: boolean;
  tone?: 'dark' | 'light';
}

/**
 * Logo LES.cz – visačka s cenou (e-shop), ve které roste smrk (les).
 * Značka funguje samostatně jako avatar na sociálních sítích.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M10 8 H38 L56 30 Q58 32 56 34 L38 56 H10 Q6 56 6 52 V12 Q6 8 10 8 Z"
        fill="#13311F"
      />
      <circle cx="44" cy="32" r="4" fill="#F2D675" />
      <path d="M24 14 L34 28 H29 L37 39 H31 L39 49 H9 L17 39 H11 L19 28 H14 Z" fill="#5A9550" />
      <path d="M24 14 L34 28 H29 L37 39 H31 L39 49 H24 Z" fill="#86B67A" />
      <rect x="22" y="49" width="4" height="5" rx="1" fill="#B78E62" />
    </svg>
  );
}

export default function Logo({ className, markOnly, tone = 'dark' }: Props) {
  if (markOnly) return <LogoMark className={className} />;
  const text = tone === 'dark' ? 'text-forest-900' : 'text-white';
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className={`font-display text-2xl font-bold leading-none tracking-tight ${text}`}>
        LES<span className="text-honey-400">.</span>
        <span className={tone === 'dark' ? 'text-forest-600' : 'text-forest-200'}>cz</span>
      </span>
    </span>
  );
}
