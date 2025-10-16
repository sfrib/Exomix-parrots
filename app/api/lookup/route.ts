import { NextRequest, NextResponse } from 'next/server';

import { createReadonlyClient } from '@/src/lib/supabase';

const ALLOWED_TABLES = new Set(['species', 'ingredients', 'supplements', 'nutrient_refs']);

export async function GET(request: NextRequest) {
  const table = request.nextUrl.searchParams.get('table');
  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Neplatná hodnota parametru table' }, { status: 400 });
  }

  const supabase = createReadonlyClient();
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (table === 'species') {
    return NextResponse.json(
      (data ?? []).map((row) => ({
        id: row.id,
        czechName: row.czech_name ?? row.czechName,
        latinName: row.latin_name ?? row.latinName,
        category: row.category,
      })),
    );
  }

  if (table === 'ingredients') {
    return NextResponse.json(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        protein_pct: row.protein_pct ?? row.protein,
        fat_pct: row.fat_pct ?? row.fat,
      })),
    );
  }

  return NextResponse.json(data ?? []);
}
