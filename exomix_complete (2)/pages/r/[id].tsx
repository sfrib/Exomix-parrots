
import { useRouter } from 'next/router';

export default function PublicRecipe() {
  const router = useRouter();
  const { id, t } = router.query;
  // TODO: verify token server-side via getServerSideProps
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Veřejný recept</h1>
      <p className="text-sm text-gray-600">ID: {String(id)} • token: {String(t)}</p>
      {/* Render public view of recipe */}
      <div className="mt-4 border rounded p-4">Zde vykreslit náhled receptu (nutriční tabulka, složení, badge s Ca:P…)</div>
    </main>
  );
}
