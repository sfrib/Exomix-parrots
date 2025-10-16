import { FeedingGoal, Ingredient, OptimizationResult, RecipeItemInput, Species } from '../types/types';
import { computeBlend } from './nutrition';
import { CATEGORY_TARGETS } from './targets';

interface OptimizeParams {
  items: Array<RecipeItemInput & { ingredient: Ingredient }>;
  species: Species;
  goal: FeedingGoal;
  iterations?: number;
}

const STEP_PERCENT = 5;

function cloneItemsWithPercentages(
  items: Array<RecipeItemInput & { ingredient: Ingredient }>,
): Array<RecipeItemInput & { ingredient: Ingredient; percentage: number }> {
  const total = items.reduce((sum, item) => sum + item.amount_g, 0);
  return items.map((item) => ({
    ...item,
    percentage: (item.amount_g / total) * 100,
  }));
}

function rebalancePercentages(
  items: Array<RecipeItemInput & { ingredient: Ingredient; percentage: number }>,
  nutrient: 'protein_pct' | 'fat_pct',
  direction: 'increase' | 'decrease',
): boolean {
  if (items.length < 2) {
    return false;
  }

  const sorted = [...items].sort((a, b) => b.ingredient[nutrient] - a.ingredient[nutrient]);
  const high = sorted[0];
  const low = sorted[sorted.length - 1];

  if (high === low) {
    return false;
  }

  const donor = direction === 'increase' ? low : high;
  const receiver = direction === 'increase' ? high : low;
  const transferable = Math.min(STEP_PERCENT, donor.percentage - 1);
  if (transferable <= 0) {
    return false;
  }
  donor.percentage -= transferable;
  receiver.percentage += transferable;
  return true;
}

function toRecipeItems(
  items: Array<RecipeItemInput & { ingredient: Ingredient; percentage: number }>,
): Array<RecipeItemInput & { ingredient: Ingredient }> {
  return items.map((item) => ({
    ingredient: item.ingredient,
    ingredientId: item.ingredientId,
    amount_g: Number(item.percentage.toFixed(1)),
  }));
}

function normalizeTotal(
  items: Array<RecipeItemInput & { ingredient: Ingredient }>,
): Array<RecipeItemInput & { ingredient: Ingredient }> {
  const total = items.reduce((sum, item) => sum + item.amount_g, 0);
  if (Math.abs(total - 100) < 0.001) {
    return items;
  }
  if (total === 0) {
    return items;
  }
  const normalized = items.map((item) => ({
    ...item,
    amount_g: Number(((item.amount_g / total) * 100).toFixed(1)),
  }));
  const correction = 100 - normalized.reduce((sum, item) => sum + item.amount_g, 0);
  if (normalized.length > 0 && Math.abs(correction) > 0.01) {
    normalized[0] = {
      ...normalized[0],
      amount_g: Number((normalized[0].amount_g + correction).toFixed(1)),
    };
  }
  return normalized;
}

/**
 * Heuristic optimizer that nudges ingredient percentages towards macro nutrient targets.
 * @param params - Optimization parameters combining items, species and goal.
 * @returns Suggested new ingredient distribution and recomputed composition.
 */
export function optimizeBlend({ items, species, goal, iterations = 3 }: OptimizeParams): OptimizationResult {
  const percentItems = cloneItemsWithPercentages(items);
  const targets = CATEGORY_TARGETS[species.category];

  for (let i = 0; i < iterations; i += 1) {
    const gramsItems = percentItems.map((item) => ({
      ingredient: item.ingredient,
      ingredientId: item.ingredientId,
      amount_g: (item.percentage / 100) * 100,
    }));
    const composition = computeBlend(gramsItems, { species, goal });

    let adjusted = false;
    if (composition.protein_pct < targets.protein_pct.min) {
      adjusted = rebalancePercentages(percentItems, 'protein_pct', 'increase') || adjusted;
    } else if (composition.protein_pct > targets.protein_pct.max) {
      adjusted = rebalancePercentages(percentItems, 'protein_pct', 'decrease') || adjusted;
    }

    if (composition.fat_pct > targets.fat_pct.max) {
      adjusted = rebalancePercentages(percentItems, 'fat_pct', 'decrease') || adjusted;
    } else if (composition.fat_pct < targets.fat_pct.min) {
      adjusted = rebalancePercentages(percentItems, 'fat_pct', 'increase') || adjusted;
    }

    if (!adjusted) {
      break;
    }
  }

  const suggestedItems = normalizeTotal(toRecipeItems(percentItems));
  const composition = computeBlend(
    suggestedItems.map((item) => ({ ...item })),
    { species, goal },
  );

  return {
    suggestedItems: suggestedItems.map((item) => ({
      ingredientId: item.ingredientId,
      amount_g: item.amount_g,
    })),
    composition,
  };
}
