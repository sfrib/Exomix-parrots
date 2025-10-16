import { revalidatePath } from 'next/cache';

import IngredientsClient from './IngredientsClient';
import { createReadonlyClient, createServiceClient } from '@/src/lib/supabase';
import type { Ingredient } from '@/src/types/types';

export const dynamic = 'force-dynamic';

function mapIngredient(row: Record<string, unknown>): Ingredient {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    category: String(row.category ?? ''),
    protein_pct: Number(row.protein_pct ?? row.protein ?? 0),
    fat_pct: Number(row.fat_pct ?? row.fat ?? 0),
    fiber_pct: Number(row.fiber_pct ?? row.fiber ?? 0),
    moisture_pct: Number(row.moisture_pct ?? row.moisture ?? 0),
    calcium_pct: Number(row.calcium_pct ?? row.calcium ?? 0),
    phosphorus_pct: Number(row.phosphorus_pct ?? row.phosphorus ?? 0),
    price_per_kg: Number(row.price_per_kg ?? row.pricePerKg ?? 0),
  };
}

export default async function IngredientsPage() {
  const supabase = createReadonlyClient();
  const { data } = await supabase.from('ingredients').select('*');
  const ingredients = (data ?? []).map(mapIngredient);
  return <IngredientsClient ingredients={ingredients} onCreate={createIngredient} onUpdate={updateIngredient} />;
}

function parseNumber(formData: FormData, key: string): number {
  const value = Number.parseFloat(String(formData.get(key) ?? '0'));
  if (Number.isNaN(value)) {
    throw new Error(`Neplatná hodnota pro ${key}`);
  }
  return value;
}

export async function createIngredient(formData: FormData) {
  'use server';
  const supabase = createServiceClient();
  const payload = {
    name: String(formData.get('name') ?? ''),
    category: String(formData.get('category') ?? ''),
    protein_pct: parseNumber(formData, 'protein_pct'),
    fat_pct: parseNumber(formData, 'fat_pct'),
    fiber_pct: parseNumber(formData, 'fiber_pct'),
    calcium_pct: parseNumber(formData, 'calcium_pct'),
    phosphorus_pct: parseNumber(formData, 'phosphorus_pct'),
    price_per_kg: parseNumber(formData, 'price_per_kg'),
  };
  const { error } = await supabase.from('ingredients').insert(payload);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/admin/ingredients');
}

export async function updateIngredient(formData: FormData) {
  'use server';
  const supabase = createServiceClient();
  const id = Number.parseInt(String(formData.get('id') ?? ''), 10);
  if (Number.isNaN(id)) {
    throw new Error('Chybějící ID ingredience');
  }
  const payload = {
    name: String(formData.get('name') ?? ''),
    category: String(formData.get('category') ?? ''),
    protein_pct: parseNumber(formData, 'protein_pct'),
    fat_pct: parseNumber(formData, 'fat_pct'),
    fiber_pct: parseNumber(formData, 'fiber_pct'),
    calcium_pct: parseNumber(formData, 'calcium_pct'),
    phosphorus_pct: parseNumber(formData, 'phosphorus_pct'),
    price_per_kg: parseNumber(formData, 'price_per_kg'),
  };
  const { error } = await supabase.from('ingredients').update(payload).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/admin/ingredients');
}
