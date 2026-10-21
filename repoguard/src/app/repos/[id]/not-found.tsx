import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <p className="text-slate-600">Repozitář nebyl nalezen nebo k němu nemáte přístup.</p>
      <Link href="/dashboard" className="btn-secondary mt-4">
        Zpět na přehled
      </Link>
    </div>
  );
}
