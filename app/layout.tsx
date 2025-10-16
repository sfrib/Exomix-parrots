import './globals.css';

import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'ExoMix',
  description: 'Výživa exotických ptáků – ExoMix',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <div className="min-h-screen flex">
          <aside className="w-64 bg-white border-r">
            <div className="p-4 font-semibold text-brand text-lg">ExoMix</div>
            <nav className="px-2 flex flex-col gap-1">
              <Link className="px-3 py-2 rounded hover:bg-gray-50" href="/">Dashboard</Link>
              <Link className="px-3 py-2 rounded hover:bg-gray-50" href="/recipes">Recepty</Link>
              <Link className="px-3 py-2 rounded hover:bg-gray-50" href="/notifications">Upozornění</Link>
              <Link className="px-3 py-2 rounded hover:bg-gray-50" href="/suppliers">Dodavatelé</Link>
              <Link className="px-3 py-2 rounded hover:bg-gray-50" href="/settings">Nastavení</Link>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="h-14 border-b bg-white flex items-center justify-between px-4">
              <div className="text-sm text-muted">VetExotic • ExoMix</div>
              <div className="flex items-center gap-3">
                <a className="badge" href="/notifications">3</a>
                <div className="w-8 h-8 rounded-full bg-brand/10"></div>
              </div>
            </div>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
