import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { recipeSchema } from '@/src/lib/exportSchema';

function toCsv(body: z.infer<typeof recipeSchema>): string {
  const header = ['Ingredience', 'Kategorie', 'Množství (g)'];
  const rows = body.items.map((item) => [
    item.ingredient.name,
    item.ingredient.category,
    item.amount_g.toFixed(1),
  ]);

  const compositionRows = [
    ['Protein %', body.composition.protein_pct.toFixed(2)],
    ['Tuk %', body.composition.fat_pct.toFixed(2)],
    ['Vláknina %', body.composition.fiber_pct.toFixed(2)],
    ['Vlhkost %', body.composition.moisture_pct.toFixed(2)],
    ['Vápník %', body.composition.calcium_pct.toFixed(3)],
    ['Fosfor %', body.composition.phosphorus_pct.toFixed(3)],
    ['Ca:P', body.composition.ca_to_p?.toFixed(2) ?? 'N/A'],
    ['DMI (g)', body.composition.dry_matter_intake_g.toFixed(1)],
    ['Cena/den', body.composition.cost_per_day.toFixed(2)],
  ];

  const allRows = [
    ['Druh', body.species.czechName],
    ['Latinsky', body.species.latinName],
    ['Kategorie', body.species.category],
    ['Cíl', body.goal],
    ['Hmotnost (g)', body.species.averageWeight_g.toFixed(0)],
    [],
    header,
    ...rows,
    [],
    ['Analytika'],
    ...compositionRows,
  ];

  return allRows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = recipeSchema.parse(json);
    const csv = toCsv(parsed);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="exomix-report.csv"',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Neznámá chyba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
