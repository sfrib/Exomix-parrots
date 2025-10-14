
import Link from 'next/link';
import Card from '@/components/Card';

export default function RecipesPage(){
  const recipes = [
    { id: 'r1', name: 'Hepatic v1.3', species: 'Žako šedý', status: 'PENDING' },
    { id: 'r2', name: 'Ara Energy Mix v2', species: 'Ara ararauna', status: 'APPROVED' },
  ];
  return (
    <div className="container-lg">
      <Card title="Recepty">
        <table className="w-full text-sm">
          <thead><tr className="text-muted"><th className="text-left p-2">Název</th><th className="text-left p-2">Druh</th><th className="text-left p-2">Stav</th><th></th></tr></thead>
          <tbody>
            {recipes.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.species}</td>
                <td className="p-2"><span className="badge">{r.status}</span></td>
                <td className="p-2 text-right"><Link href={`/recipes/${r.id}`} className="btn btn-secondary">Otevřít</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
