
export default function Page() {
  return (
    <div className="container-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-muted">Dnes</div>
          <div className="text-lg font-semibold">Vítej v ExoMix</div>
          <p className="text-sm mt-2">Začni receptem nebo zkontroluj upozornění.</p>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Rychlé akce</div>
          <div className="mt-2 flex gap-2">
            <a className="btn btn-primary" href="/recipes/new">Nový recept</a>
            <a className="btn btn-secondary" href="/suppliers">Hledat suroviny</a>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Vet režim</div>
          <div className="mt-2">Speciální diety vyžadují schválení veterinářem.</div>
        </div>
      </div>
    </div>
  );
}
