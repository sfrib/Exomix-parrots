import type { IllustrationKind } from '@/lib/types';

interface Props {
  kind: IllustrationKind;
  color: string;
  accent: string;
  className?: string;
  /** Přístupný popis; bez něj je ilustrace dekorativní. */
  title?: string;
}

/**
 * Stylizované botanické ilustrace (SVG, bez externích obrázků).
 * Slouží jako produktový obrázek do doby, než budou doplněny licencované fotografie.
 * Ilustrace NEJSOU určené k určování rostlin.
 */
export default function PlantIllustration({ kind, color, accent, className, title }: Props) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  return (
    <svg viewBox="0 0 200 200" className={className} {...a11y}>
      <defs>
        <radialGradient id={`bg-${kind}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F3EBDD" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg-${kind})`} />
      <circle cx="100" cy="104" r="74" fill={accent} opacity="0.08" />
      {renderKind(kind, color, accent)}
    </svg>
  );
}

function Leaf({ x, y, r, s = 1, fill, vein = 'rgba(255,255,255,.55)' }: { x: number; y: number; r: number; s?: number; fill: string; vein?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C 14 -16, 40 -16, 56 0 C 40 16, 14 16, 0 0 Z" fill={fill} />
      <path d="M2 0 L 52 0" stroke={vein} strokeWidth="1.6" />
      <path d="M16 0 L 24 -7 M26 0 L 34 -7 M36 0 L 43 -6 M16 0 L 24 7 M26 0 L 34 7 M36 0 L 43 6" stroke={vein} strokeWidth="1.1" />
    </g>
  );
}

function renderKind(kind: IllustrationKind, color: string, accent: string) {
  switch (kind) {
    case 'berry':
      return (
        <g>
          <path d="M70 52 C 92 60, 104 76, 108 98" stroke="#6B4A2B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <Leaf x={70} y={54} r={-150} s={0.95} fill={accent} />
          <Leaf x={92} y={66} r={-40} s={0.85} fill={accent} />
          {[
            [100, 112, 17],
            [124, 116, 15],
            [110, 136, 16],
            [86, 132, 14],
            [132, 140, 13],
            [96, 156, 12],
          ].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={color} />
              <circle cx={cx - r / 3} cy={cy - r / 3} r={r / 4} fill="#FFFFFF" opacity="0.45" />
            </g>
          ))}
        </g>
      );
    case 'leaf':
      return (
        <g>
          <path d="M60 158 C 80 130, 96 110, 112 92" stroke="#6B4A2B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <g transform="translate(100 104) rotate(-48)">
            <path d="M0 0 C 26 -42, 92 -40, 112 0 C 92 40, 26 42, 0 0 Z" fill={color} />
            <path d="M4 0 L 104 0" stroke="rgba(255,255,255,.6)" strokeWidth="2.2" />
            {[22, 40, 58, 76, 90].map((x) => (
              <g key={x}>
                <path d={`M${x} 0 L ${x + 14} -18`} stroke="rgba(255,255,255,.5)" strokeWidth="1.4" />
                <path d={`M${x} 0 L ${x + 14} 18`} stroke="rgba(255,255,255,.5)" strokeWidth="1.4" />
              </g>
            ))}
          </g>
          <Leaf x={66} y={146} r={-120} s={0.7} fill={accent} />
        </g>
      );
    case 'branch':
      return (
        <g>
          <path d="M30 150 C 70 130, 110 110, 172 70" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M84 124 C 92 104, 96 92, 94 74" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M126 98 C 140 104, 150 116, 156 132" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
          {[
            [56, 138],
            [110, 108],
            [146, 86],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.5" ry="5" fill="#3F2B19" opacity="0.5" transform={`rotate(-30 ${x} ${y})`} />
          ))}
          <Leaf x={94} y={74} r={-80} s={0.75} fill={accent} />
          <Leaf x={94} y={78} r={-130} s={0.6} fill={accent} />
          <Leaf x={156} y={132} r={60} s={0.65} fill={accent} />
          <Leaf x={172} y={70} r={-30} s={0.7} fill={accent} />
          <circle cx="94" cy="74" r="4" fill="#E6BF3F" />
        </g>
      );
    case 'flower':
      return (
        <g>
          <path d="M100 112 C 98 140, 100 160, 104 178" stroke={accent} strokeWidth="4" fill="none" />
          <Leaf x={101} y={160} r={-150} s={0.7} fill={accent} />
          {Array.from({ length: 14 }).map((_, i) => (
            <ellipse key={i} cx="100" cy="72" rx="7" ry="24" fill={color} transform={`rotate(${(360 / 14) * i} 100 96)`} />
          ))}
          <circle cx="100" cy="96" r="15" fill="#E6BF3F" />
          <circle cx="96" cy="92" r="4" fill="#FFFFFF" opacity="0.5" />
        </g>
      );
    case 'cone':
      return (
        <g>
          <path d="M100 40 L 100 52" stroke="#553A22" strokeWidth="4" strokeLinecap="round" />
          <path d="M100 50 C 140 62, 146 120, 100 168 C 54 120, 60 62, 100 50 Z" fill={color} />
          {[66, 84, 102, 120, 138].map((y, row) =>
            [-2, -1, 0, 1, 2].map((col) => {
              const width = 18 - Math.abs(row - 2) * 2;
              const x = 100 + col * width + (row % 2 ? width / 2 : 0);
              const inside = Math.abs(x - 100) < 38 - Math.abs(y - 104) * 0.35;
              return inside ? (
                <path key={`${row}-${col}`} d={`M${x - 9} ${y} Q ${x} ${y + 14} ${x + 9} ${y}`} stroke={accent} strokeWidth="2.4" fill="none" />
              ) : null;
            }),
          )}
        </g>
      );
    case 'nut':
      return (
        <g>
          <ellipse cx="104" cy="122" rx="38" ry="42" fill={color} />
          <path d="M80 104 C 90 96, 100 94, 112 96" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M60 92 C 74 66, 136 60, 150 90 C 138 84, 128 96, 118 86 C 108 96, 98 84, 88 94 C 80 86, 70 96, 60 92 Z" fill={accent} />
          <Leaf x={112} y={68} r={-60} s={0.8} fill={accent} />
        </g>
      );
    case 'grass':
      return (
        <g>
          {[
            'M70 176 C 72 130, 66 96, 54 62',
            'M92 176 C 92 120, 96 80, 104 40',
            'M114 176 C 116 130, 128 100, 146 74',
            'M84 176 C 80 140, 76 120, 64 104',
          ].map((d, i) => (
            <path key={i} d={d} stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx={104 + (i % 2 ? 6 : -6)} cy={44 + i * 7} rx="4" ry="7" fill={color} transform={`rotate(${i % 2 ? 25 : -25} ${104 + (i % 2 ? 6 : -6)} ${44 + i * 7})`} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={`b${i}`} cx={54 + (i % 2 ? 5 : -5)} cy={62 + i * 6} rx="3" ry="6" fill={color} opacity="0.85" transform={`rotate(${i % 2 ? 30 : -30} ${54 + (i % 2 ? 5 : -5)} ${62 + i * 6})`} />
          ))}
        </g>
      );
    case 'bark':
      return (
        <g>
          <rect x="52" y="34" width="96" height="140" rx="14" fill={color} />
          {[64, 82, 100, 118, 134].map((x, i) => (
            <path
              key={x}
              d={`M${x} 40 C ${x + (i % 2 ? 6 : -6)} 80, ${x + (i % 2 ? -6 : 6)} 120, ${x} 168`}
              stroke="#3F2B19"
              strokeOpacity="0.45"
              strokeWidth="3"
              fill="none"
            />
          ))}
          {[
            [76, 70],
            [116, 98],
            [92, 138],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="9" ry="4" fill={accent} opacity="0.9" />
          ))}
        </g>
      );
    case 'herb':
      return (
        <g>
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = -160 + i * 23;
            return (
              <g key={i} transform={`translate(100 150) rotate(${angle})`}>
                <path
                  d="M0 0 C 10 -8, 20 -4, 26 -10 C 30 -4, 40 -10, 46 -14 C 50 -6, 62 -10, 70 -12 C 64 0, 70 6, 70 6 C 50 10, 20 10, 0 0 Z"
                  fill={i % 2 ? accent : color}
                />
              </g>
            );
          })}
          <path d="M100 150 C 100 120, 102 90, 104 66" stroke={accent} strokeWidth="3" fill="none" />
          <circle cx="104" cy="60" r="12" fill="#E6BF3F" />
          {Array.from({ length: 10 }).map((_, i) => (
            <path key={i} d="M104 60 L 104 44" stroke="#E6BF3F" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 36} 104 60)`} />
          ))}
        </g>
      );
    case 'warning':
      return (
        <g>
          <g transform="translate(100 104) rotate(-35)">
            <path d="M-50 0 C -30 -34, 30 -34, 50 0 C 30 34, -30 34, -50 0 Z" fill={color} opacity="0.85" />
            <path d="M-46 0 L 46 0" stroke="rgba(255,255,255,.55)" strokeWidth="2" />
          </g>
          {[
            [70, 140],
            [86, 150],
            [76, 158],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="8" fill="#1C2A1F" />
          ))}
          <circle cx="100" cy="104" r="66" fill="none" stroke="#A3262A" strokeWidth="10" />
          <path d="M54 58 L 146 150" stroke="#A3262A" strokeWidth="10" strokeLinecap="round" />
          <g transform="translate(150 54)">
            <path d="M0 -20 L 20 16 L -20 16 Z" fill="#F2D675" stroke="#1C2A1F" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M0 -8 L 0 4" stroke="#1C2A1F" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="10" r="1.8" fill="#1C2A1F" />
          </g>
          <circle cx="0" cy="0" r="0" fill={accent} />
        </g>
      );
    default:
      return null;
  }
}
