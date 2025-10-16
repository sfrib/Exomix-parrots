import { revalidatePath } from 'next/cache';

import SpeciesClient from './SpeciesClient';
import { createReadonlyClient, createServiceClient } from '@/src/lib/supabase';
import type { Species } from '@/src/types/types';

export const dynamic = 'force-dynamic';

function mapSpecies(row: Record<string, unknown>): Species {
  return {
    id: Number(row.id),
    czechName: String(row.czech_name ?? row.czechName ?? ''),
    latinName: String(row.latin_name ?? row.latinName ?? ''),
    category: (row.category as Species['category']) ?? 'Střední papoušek',
    averageWeight_g: Number(row.average_weight_g ?? row.averageWeight_g ?? 0),
    dietType: String(row.diet_type ?? row.dietType ?? ''),
    lifeStage: String(row.life_stage ?? row.lifeStage ?? ''),
    seasonality: (row.seasonality as string | null | undefined) ?? null,
  };
}

export default async function SpeciesPage() {
  const supabase = createReadonlyClient();
  const { data } = await supabase.from('species').select('*');
  const species = (data ?? []).map(mapSpecies);
  return <SpeciesClient species={species} onUpdate={updateSpecies} />;
}

export async function updateSpecies(formData: FormData) {
  'use server';
  const supabase = createServiceClient();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isNaN(id)) {
    throw new Error('Chybějící ID druhu');
  }
  const payload = {
    category: String(formData.get('category') ?? ''),
    average_weight_g: Number.parseFloat(String(formData.get('averageWeight_g') ?? '0')),
  };
  if (Number.isNaN(payload.average_weight_g) || payload.average_weight_g <= 0) {
    throw new Error('Neplatná hodnota hmotnosti');
  }
  const { error } = await supabase.from('species').update(payload).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/admin/species');
}
