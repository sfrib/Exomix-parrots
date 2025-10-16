import { FeedingGoal, Ingredient, RecipeComposition, RecipeItemInput, RecipeOutput, Species, Tip } from '../types/types';

const DAILY_INTAKE_FACTORS: Record<FeedingGoal, number> = {
  'udržovací': 0.08,
  'chovný pár': 0.1,
  'růst': 0.12,
  'rekonvalescence': 0.11,
};

/**
 * Estimate the daily dry matter intake (DMI) for a parrot based on body weight and goal.
 * @param weight_g - Body weight of the bird in grams.
 * @param goal - Feeding goal that adjusts metabolic requirements.
 * @returns Daily dry matter intake in grams.
 */
export function estimateDailyIntake(weight_g: number, goal: FeedingGoal): number {
  const factor = DAILY_INTAKE_FACTORS[goal];
  const baseline = weight_g * factor;
  return Number(baseline.toFixed(1));
}

/**
 * Calculate the Ca:P ratio safeguarding division by zero.
 * @param calcium_pct - Calcium percentage of the blend.
 * @param phosphorus_pct - Phosphorus percentage of the blend.
 * @returns Calculated Ca:P ratio or null when phosphorus is negligible.
 */
export function calcCaPRatio(calcium_pct: number, phosphorus_pct: number): number | null {
  if (phosphorus_pct <= 0) {
    return null;
  }
  return Number((calcium_pct / phosphorus_pct).toFixed(2));
}

interface ComputeBlendOptions {
  species: Species;
  goal: FeedingGoal;
}

/**
 * Compute the weighted blend for macro nutrients and economics of the recipe.
 * @param items - Selected items containing amount in grams.
 * @param options - Species meta providing weight and goal.
 * @returns Recipe composition summary.
 */
export function computeBlend(
  items: Array<RecipeItemInput & { ingredient: Ingredient }>,
  options: ComputeBlendOptions,
): RecipeComposition {
  const totalAmount = items.reduce((sum, item) => sum + item.amount_g, 0);
  if (totalAmount <= 0) {
    throw new Error('Recipe items must have a positive combined weight.');
  }

  const weighted = items.reduce(
    (acc, item) => {
      const proportion = item.amount_g / totalAmount;
      acc.protein += item.ingredient.protein_pct * proportion;
      acc.fat += item.ingredient.fat_pct * proportion;
      acc.fiber += item.ingredient.fiber_pct * proportion;
      acc.moisture += item.ingredient.moisture_pct * proportion;
      acc.calcium += item.ingredient.calcium_pct * proportion;
      acc.phosphorus += item.ingredient.phosphorus_pct * proportion;
      acc.cost += (item.ingredient.price_per_kg / 1000) * item.amount_g;
      return acc;
    },
    {
      protein: 0,
      fat: 0,
      fiber: 0,
      moisture: 0,
      calcium: 0,
      phosphorus: 0,
      cost: 0,
    },
  );

  const dryMatterIntake = estimateDailyIntake(options.species.averageWeight_g, options.goal);
  const costPerGram = weighted.cost / totalAmount;
  const costPerDay = Number((costPerGram * dryMatterIntake).toFixed(2));
  const caToP = calcCaPRatio(weighted.calcium, weighted.phosphorus);

  return {
    protein_pct: Number(weighted.protein.toFixed(2)),
    fat_pct: Number(weighted.fat.toFixed(2)),
    fiber_pct: Number(weighted.fiber.toFixed(2)),
    moisture_pct: Number(weighted.moisture.toFixed(2)),
    calcium_pct: Number(weighted.calcium.toFixed(3)),
    phosphorus_pct: Number(weighted.phosphorus.toFixed(3)),
    ca_to_p: caToP,
    cost_per_day: costPerDay,
    dry_matter_intake_g: dryMatterIntake,
  };
}

/**
 * Provide simple supplement tips when the composition falls outside common expectations.
 * @param composition - Resulting composition from the blend.
 * @returns Array of supplement hints.
 */
export function generateSupplementTips(composition: RecipeComposition): Tip[] {
  const tips: Tip[] = [];
  if (composition.ca_to_p !== null && composition.ca_to_p < 1.6) {
    tips.push({
      nutrient: 'ca_to_p',
      message: 'Zvaž přidání vápenného doplňku (např. uhličitan vápenatý) pro zvýšení Ca:P.',
    });
  }
  if (composition.protein_pct < 13) {
    tips.push({
      nutrient: 'protein_pct',
      message: 'Nízké bílkoviny – přidej luštěninové nebo klíčené složky s vyšším obsahem proteinu.',
    });
  }
  if (composition.fat_pct > 15) {
    tips.push({
      nutrient: 'fat_pct',
      message: 'Vyšší tuk – nahraď část směsi nízkotučnými obilninami nebo extrudáty.',
    });
  }
  if (composition.fiber_pct < 5) {
    tips.push({
      nutrient: 'fiber_pct',
      message: 'Nedostatek vlákniny – přidej zelené krmivo nebo extrudované pelety bohaté na vlákninu.',
    });
  }
  return tips;
}

/**
 * Build the recipe output domain object combining species meta, inputs and computed composition.
 * @param species - Selected species metadata.
 * @param goal - Declared feeding goal.
 * @param items - Items enriched with ingredient data.
 * @returns Recipe output ready for the API response.
 */
export function composeRecipeOutput(
  species: Species,
  goal: FeedingGoal,
  items: Array<RecipeItemInput & { ingredient: Ingredient }>,
): RecipeOutput {
  const composition = computeBlend(items, { species, goal });
  return {
    species,
    goal,
    items,
    composition,
  };
}
