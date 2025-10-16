import { z } from 'zod';

import { goalEnum } from '@/app/api/configurator/route';

export const compositionSchema = z.object({
  protein_pct: z.number(),
  fat_pct: z.number(),
  fiber_pct: z.number(),
  moisture_pct: z.number(),
  calcium_pct: z.number(),
  phosphorus_pct: z.number(),
  ca_to_p: z.number().nullable(),
  cost_per_day: z.number(),
  dry_matter_intake_g: z.number(),
});

export const ingredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  protein_pct: z.number(),
  fat_pct: z.number(),
  fiber_pct: z.number(),
  moisture_pct: z.number(),
  calcium_pct: z.number(),
  phosphorus_pct: z.number(),
  price_per_kg: z.number(),
});

export const recipeSchema = z.object({
  species: z.object({
    id: z.number(),
    czechName: z.string(),
    latinName: z.string(),
    category: z.string(),
    averageWeight_g: z.number(),
    dietType: z.string(),
    lifeStage: z.string(),
    seasonality: z.string().nullable(),
  }),
  goal: goalEnum,
  items: z.array(
    z.object({
      ingredientId: z.number(),
      amount_g: z.number(),
      ingredient: ingredientSchema,
    }),
  ),
  composition: compositionSchema,
});

export type RecipeSchema = z.infer<typeof recipeSchema>;
