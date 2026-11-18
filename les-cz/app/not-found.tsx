import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-les py-24 text-center">
      <p className="font-display text-8xl font-bold text-forest-200">404</p>
      <h1 className="h-display mt-4 text-4xl">Tahle cesta v lese nevede nikam.</h1>
      <p className="mx-auto mt-3 max-w-lg text-ink/70">
        Zboží je vyprodané, strom spadl, nebo jste zabloudili. Lesní skladník doporučuje vrátit se k rozcestníku.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Zpět na úvod</Link>
        <Link href="/obchod" className="btn-ghost">Celý sortiment</Link>
      </div>
    </div>
  );
}
