
'use client';

import SaveBar from '@/components/SaveBar';
import Card from '@/components/Card';
import { useRouter } from 'next/navigation';

export default function RecipeDetail(){
  const router = useRouter();
  async function onSave(){ alert('Uloženo'); }
  async function onSubmitReview(){ alert('Odesláno ke schválení'); }
  async function onExportLabel(){ router.push('/recipes/r1/label'); }
  async function onPrintPDF(){ window.open('/api/recipes/r1/label-pdf', '_blank'); }
  return (
    <div className="container-lg space-y-4 pb-24">
      <Card title="Hepatic v1.3 – Žako šedý" actions={<a className='btn btn-secondary' href='/recipes/r1/composition'>Grafy</a>}>
        <div className="text-sm text-muted">Speciální dieta – <strong>vyžaduje schválení veterinářem</strong>.</div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="card p-3">
            <div className="label">Tuk (%)</div><input className="input" defaultValue={8.5}/>
            <div className="label mt-2">Bílkoviny (%)</div><input className="input" defaultValue={11.8}/>
            <div className="label mt-2">Vláknina (%)</div><input className="input" defaultValue={12}/>
          </div>
          <div className="card p-3">
            <div className="label">Ca:P</div><input className="input" defaultValue={"2.1:1"}/>
            <div className="label mt-2">Cena (Kč/kg)</div><input className="input" defaultValue={129}/>
          </div>
        </div>
      </Card>
      <SaveBar onSave={onSave} onSubmitReview={onSubmitReview} onExportLabel={onExportLabel} onPrintPDF={onPrintPDF} />
    </div>
  );
}
