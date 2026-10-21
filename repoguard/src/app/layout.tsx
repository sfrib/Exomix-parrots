import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { SignOutButton } from "@/components/AuthButtons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "RepoGuard",
  description: "Security check for your GitHub repositories",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-slate-900">
              <Logo className="h-6 w-6 text-emerald-600" />
              RepoGuard
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {user && (
                <>
                  <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                    {t("nav.overview", locale)}
                  </Link>
                  <Link href="/repos/add" className="whitespace-nowrap text-slate-600 hover:text-slate-900">
                    <span className="sm:hidden">{t("nav.addShort", locale)}</span>
                    <span className="hidden sm:inline">{t("nav.addRepo", locale)}</span>
                  </Link>
                  <span className="flex items-center gap-2 text-slate-700">
                    {user.avatarUrl && <Image src={user.avatarUrl} alt="" width={24} height={24} className="rounded-full" />}
                    <span className="hidden sm:inline">{user.login}</span>
                  </span>
                  <SignOutButton label={t("nav.signOut", locale)} />
                </>
              )}
              <LanguageSwitcher locale={locale} />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-400">{t("app.footer", locale)}</footer>
      </body>
    </html>
  );
}
