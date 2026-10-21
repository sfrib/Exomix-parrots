import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "@/components/AuthButtons";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "RepoGuard",
  description: "Bezpečnostní kontrola vašich GitHub repozitářů",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="cs">
      <body className="min-h-screen">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-slate-900">
              <Logo className="h-6 w-6 text-emerald-600" />
              RepoGuard
            </Link>
            {user && (
              <nav className="flex items-center gap-5 text-sm">
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                  Přehled
                </Link>
                <Link href="/repos/add" className="whitespace-nowrap text-slate-600 hover:text-slate-900">
                  <span className="sm:hidden">+ Přidat</span>
                  <span className="hidden sm:inline">Přidat repozitář</span>
                </Link>
                <span className="flex items-center gap-2 text-slate-700">
                  {user.avatarUrl && <Image src={user.avatarUrl} alt="" width={24} height={24} className="rounded-full" />}
                  <span className="hidden sm:inline">{user.login}</span>
                </span>
                <SignOutButton />
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-400">
          RepoGuard pouze vyhledává a vysvětluje slabá místa ve vašem kódu. Negeneruje ani nespouští žádný útočný kód.
        </footer>
      </body>
    </html>
  );
}
