import Link from "next/link";
import { db } from "@/lib/db";
import { listAccessibleRepos } from "@/lib/github";
import { requireUser, tokenFor } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { connectRepo } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AddRepo({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;

  let error: string | null = null;
  let repos: Awaited<ReturnType<typeof listAccessibleRepos>> = [];
  try {
    repos = await listAccessibleRepos(tokenFor(user), user.login);
  } catch (err) {
    error = err instanceof Error ? err.message : "Nepodařilo se načíst repozitáře.";
  }

  const connected = new Set((await db.repo.findMany({ where: { userId: user.id }, select: { githubId: true } })).map((r) => r.githubId));
  const needle = q.trim().toLowerCase();
  const visible = repos.filter((r) => !needle || r.full_name.toLowerCase().includes(needle));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← Přehled
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Přidat repozitář</h1>
        <p className="text-sm text-slate-500">
          Zobrazují se pouze repozitáře, které vlastníte nebo k nimž máte práva zápisu či udělený přístup.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Hledat repozitář…"
          className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button className="btn-secondary">Hledat</button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <ul className="card divide-y divide-slate-100">
        {visible.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.full_name}</span>
                {r.private && <span className="rounded border border-slate-300 px-1.5 text-xs text-slate-500">soukromý</span>}
                {r.archived && <span className="rounded border border-slate-300 px-1.5 text-xs text-slate-500">archivovaný</span>}
              </div>
              <p className="truncate text-xs text-slate-500">
                {r.language ?? "—"} · poslední push {formatDateTime(r.pushed_at ? new Date(r.pushed_at) : null)}
                {r.description ? ` · ${r.description}` : ""}
              </p>
            </div>
            {connected.has(r.id) ? (
              <span className="text-sm text-emerald-700">✓ Připojeno</span>
            ) : (
              <ActionForm action={connectRepo.bind(null, r.id)} label="Připojit" pendingLabel="Připojuji…" variant="secondary" className="text-right" />
            )}
          </li>
        ))}
        {!error && visible.length === 0 && <li className="p-6 text-center text-sm text-slate-500">Žádné repozitáře nenalezeny.</li>}
      </ul>
    </div>
  );
}
