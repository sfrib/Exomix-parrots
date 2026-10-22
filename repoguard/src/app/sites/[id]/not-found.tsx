import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <p className="text-slate-600">Web nebyl nalezen / Website not found.</p>
      <Link href="/sites" className="btn-secondary mt-4">
        ← Weby / Websites
      </Link>
    </div>
  );
}
