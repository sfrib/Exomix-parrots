
import Card from '@/components/Card';
import CompositionDonut from '@/components/CompositionDonut';
import StackedMacroBar from '@/components/StackedMacroBar';

export default function CompositionPage(){
  const ingredients = [
    { label: 'Proso', value: 35 },
    { label: 'Saflor', value: 20 },
    { label: 'Lnene', value: 10 },
    { label: 'Dyňová', value: 15 },
    { label: 'Ostatní', value: 20 },
  ];
  const macros = [
    { label: 'Tuk', value: 8.5 },
    { label: 'Bílkoviny', value: 11.8 },
    { label: 'Vláknina', value: 12 },
    { label: 'Sacharidy', value: 45 },
  ];
  return (
    <div className="container-lg grid md:grid-cols-2 gap-4">
      <Card title="Podíl surovin (donut)">
        <CompositionDonut data={ingredients} total={100} />
        <div className="mt-2 text-sm text-muted">Kliky/legendu lze doplnit podle potřeby.</div>
      </Card>
      <Card title="Makroživiny (stacked bar)">
        <StackedMacroBar data={macros} total={100} />
        <div className="mt-2 text-sm text-muted">Porovnáme s ideálem druhu v další iteraci.</div>
      </Card>
    </div>
  );
}
