/**
 * Shared domain types for the ExoMix configurator modules.
 */

export type SpeciesCategory = 'Velký ara' | 'Střední papoušek' | 'Malý papoušek';

export type FeedingGoal = 'udržovací' | 'chovný pár' | 'růst' | 'rekonvalescence';

/**
 * Representation of a species record stored in Supabase.
 */
export interface Species {
  id: number;
  czechName: string;
  latinName: string;
  category: SpeciesCategory;
  averageWeight_g: number;
  dietType: string;
  lifeStage: string;
  seasonality?: string | null;
}

/**
 * Reference ranges for a nutrient.
 */
export interface NutrientReferenceRange {
  id: number;
  category: SpeciesCategory;
  nutrient: 'protein_pct' | 'fat_pct' | 'fiber_pct' | 'ca_to_p';
  unit: string;
  min: number;
  max: number;
}

/**
 * Ingredients available for mixture design.
 */
export interface Ingredient {
  id: number;
  name: string;
  category: string;
  protein_pct: number;
  fat_pct: number;
  fiber_pct: number;
  moisture_pct: number;
  calcium_pct: number;
  phosphorus_pct: number;
  price_per_kg: number;
}

/**
 * Supplements with heuristic guidance.
 */
export interface Supplement {
  id: number;
  name: string;
  nutrient: 'calcium' | 'vitaminA' | 'fiber' | 'energy';
  direction: 'increase' | 'decrease';
  description: string;
}

/**
 * Request item describing a selected ingredient.
 */
export interface RecipeItemInput {
  ingredientId: number;
  amount_g: number;
}

/**
 * Body of the configurator request.
 */
export interface RecipeRequestBody {
  speciesId?: number;
  speciesLatin?: string;
  weight_g: number;
  goal: FeedingGoal;
  items: RecipeItemInput[];
}

/**
 * Weighted composition outcome of a blend.
 */
export interface RecipeComposition {
  protein_pct: number;
  fat_pct: number;
  fiber_pct: number;
  moisture_pct: number;
  calcium_pct: number;
  phosphorus_pct: number;
  ca_to_p: number | null;
  cost_per_day: number;
  dry_matter_intake_g: number;
}

/**
 * High level summary returned from the configurator API.
 */
export interface RecipeOutput {
  species: Species;
  goal: FeedingGoal;
  items: Array<RecipeItemInput & { ingredient: Ingredient }>;
  composition: RecipeComposition;
}

/**
 * Advisory message for the user.
 */
export interface Tip {
  nutrient: 'protein_pct' | 'fat_pct' | 'fiber_pct' | 'ca_to_p';
  message: string;
}

/**
 * Deviation against the target profile.
 */
export interface Deviation {
  nutrient: 'protein_pct' | 'fat_pct' | 'fiber_pct' | 'ca_to_p';
  actual: number;
  targetMin: number;
  targetMax: number;
  differencePct: number;
  direction: 'increase' | 'decrease';
  severity: 'WARN' | 'FAIL';
}

/**
 * Optimization proposal with adjusted items and recalculated composition.
 */
export interface OptimizationResult {
  suggestedItems: RecipeItemInput[];
  composition: RecipeComposition;
}
