import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeasonalTicker from '@/components/SeasonalTicker';
import JsonLd from '@/components/JsonLd';
import { CAMPAIGNS } from '@/data/seasonal';
import { seasonOfMonth, currentMonth } from '@/lib/seasons';
import { SITE } from '@/lib/site';
import { websiteJsonLd } from '@/lib/seo';

const display = Fraunces({ subsets: ['latin', 'latin-ext'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} – ${SITE.slogan}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
    title: `${SITE.name} – ${SITE.slogan}`,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#13311F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = {
    jaro: CAMPAIGNS.jaro.messages,
    leto: CAMPAIGNS.leto.messages,
    podzim: CAMPAIGNS.podzim.messages,
    zima: CAMPAIGNS.zima.messages,
  };
  return (
    <html lang="cs" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <a href="#obsah" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-honey-300 focus:px-4 focus:py-2">
          Přeskočit na obsah
        </a>
        <JsonLd data={websiteJsonLd()} />
        <SeasonalTicker initialSeason={seasonOfMonth(currentMonth())} messages={messages} />
        <Header />
        <main id="obsah">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
