import { ImageResponse } from 'next/og';

export const alt = 'LES.cz – Nejlepší zverimex je les.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Výchozí obrázek pro sdílení na sociálních sítích. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#13311F', color: '#FBF7EF', fontFamily: 'serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="120" height="120" viewBox="0 0 64 64">
            <path d="M10 8 H38 L56 30 Q58 32 56 34 L38 56 H10 Q6 56 6 52 V12 Q6 8 10 8 Z" fill="#FBF7EF" />
            <circle cx="44" cy="32" r="4" fill="#F2D675" />
            <path d="M24 14 L34 28 H29 L37 39 H31 L39 49 H9 L17 39 H11 L19 28 H14 Z" fill="#2F6B3A" />
          </svg>
          <div style={{ fontSize: 96, fontWeight: 700 }}>LES.cz</div>
        </div>
        <div style={{ fontSize: 72, marginTop: 40, color: '#F2D675' }}>Nejlepší zverimex je les.</div>
        <div style={{ fontSize: 34, marginTop: 24, opacity: 0.8 }}>Cena: zdarma · Doprava: vlastní nohy · Pro papoušky</div>
      </div>
    ),
    size,
  );
}
