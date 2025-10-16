import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { composeRecipeOutput, generateSupplementTips } from '@/src/lib/nutrition';
import { optimizeBlend } from '@/src/lib/optimizer';
import { createReadonlyClient } from '@/src/lib/supabase';
import { evaluateAgainstTargets, resolveStatus } from '@/src/lib/targets';
import {
  Deviation,
  FeedingGoal,
  Ingredient,
  RecipeItemInput,
  RecipeOutput,
  Species,
  Tip,
} from '@/src/types/types';

const itemSchema = z.object({
  ingredientId: z.number().int().positive(),
  amount_g: z.number().positive(),
});

export const goalEnum = z.enum(['udržovací', 'chovný pár', 'růst', 'rekonvalescence'] as const);

const configuratorSchema = z
  .object({
    speciesId: z.number().int().positive().optional(),
    speciesLatin: z.string().trim().min(1, 'speciesLatin is required').optional(),
    weight_g: z.number().positive({ message: 'weight_g must be greater than 0' }),
    goal: goalEnum,
    items: z.array(itemSchema).min(1, 'Musíš zadat alespoň jednu surovinu'),
  })
  .superRefine((data, ctx) => {
    if (!data.speciesId && !data.speciesLatin) {
      ctx.addIssue({
        path: ['speciesId'],
        code: z.ZodIssueCode.custom,
        message: 'Musíš zadat speciesId nebo speciesLatin',
      });
    }
  });

type ConfiguratorBody = Omit<z.infer<typeof configuratorSchema>, 'goal'> & {
  goal: FeedingGoal;
};

interface ConfiguratorSuccess {
  ok: true;
  data: RecipeOutput;
  tips: Tip[];
  report: {
    status: 'OK' | 'WARN' | 'FAIL';
    deviations: Deviation[];
  };
  optimization?: {
    suggestedItems: RecipeItemInput[];
    composition: RecipeOutput['composition'];
  };
}

interface ErrorResponse {
  error: { field: string; message: string };
}

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

async function getSpecies(client: ReturnType<typeof createReadonlyClient>, body: ConfiguratorBody) {
  const query = client.from('species').select('*').limit(1);
  if (body.speciesId) {
    query.eq('id', body.speciesId);
  } else if (body.speciesLatin) {
    query.ilike('latin_name', body.speciesLatin);
  }
  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(`Nepodařilo se načíst druh: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapSpecies(data);
}

async function getIngredients(
  client: ReturnType<typeof createReadonlyClient>,
  ids: number[],
): Promise<Ingredient[]> {
  if (ids.length === 0) {
    return [];
  }
  const { data, error } = await client.from('ingredients').select('*').in('id', ids);
  if (error) {
    throw new Error(`Nepodařilo se načíst suroviny: ${error.message}`);
  }
  return (data ?? []).map(mapIngredient);
}

function buildErrorResponse(field: string, message: string, status = 400) {
  return NextResponse.json<ErrorResponse>(
    { error: { field, message } },
    { status },
  );
}

export async function POST(request: NextRequest) {
  let parsed: ConfiguratorBody;
  try {
    const payload = await request.json();
    parsed = configuratorSchema.parse(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return buildErrorResponse(firstIssue.path.join('.') || 'body', firstIssue.message, 400);
    }
    return buildErrorResponse('body', 'Neplatné JSON tělo', 400);
  }

  const supabase = createReadonlyClient();
  try {
    const species = await getSpecies(supabase, parsed);
    if (!species) {
      return buildErrorResponse('speciesId', 'Druh nebyl nalezen', 404);
    }

    const computeSpecies: Species = { ...species, averageWeight_g: parsed.weight_g };
    const ingredientIds = parsed.items.map((item) => item.ingredientId);
    const ingredients = await getIngredients(supabase, ingredientIds);
    const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
    const missing = ingredientIds.filter((id) => !ingredientMap.has(id));
    if (missing.length > 0) {
      return buildErrorResponse('items', `Suroviny nebyly nalezeny: ${missing.join(', ')}`, 404);
    }

    const itemsWithData = parsed.items.map((item) => ({
      ...item,
      ingredient: ingredientMap.get(item.ingredientId)!,
    }));

    const recipe = composeRecipeOutput(computeSpecies, parsed.goal, itemsWithData);
    const tips = generateSupplementTips(recipe.composition);
    const deviations = evaluateAgainstTargets(recipe.composition, species.category);
    const status = resolveStatus(deviations);

    const response: ConfiguratorSuccess = {
      ok: true,
      data: recipe,
      tips,
      report: {
        status,
        deviations,
      },
    };

    const optimize = request.nextUrl.searchParams.get('optimize');
    if (optimize === '1') {
      const optimization = optimizeBlend({
        items: itemsWithData,
        species: computeSpecies,
        goal: parsed.goal,
      });
      response.optimization = optimization;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Neznámá chyba';
    return buildErrorResponse('server', message, 500);
  }
}
