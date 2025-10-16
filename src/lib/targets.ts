import { Deviation, RecipeComposition, SpeciesCategory } from '../types/types';

interface TargetRange {
  min: number;
  max: number;
}

interface CategoryTargets {
  protein_pct: TargetRange;
  fat_pct: TargetRange;
  fiber_pct: TargetRange;
  ca_to_p: TargetRange;
}

export const CATEGORY_TARGETS: Record<SpeciesCategory, CategoryTargets> = {
  'Velký ara': {
    protein_pct: { min: 14, max: 18 },
    fat_pct: { min: 8, max: 12 },
    fiber_pct: { min: 7, max: 12 },
    ca_to_p: { min: 1.5, max: 2 },
  },
  'Střední papoušek': {
    protein_pct: { min: 12, max: 16 },
    fat_pct: { min: 6, max: 10 },
    fiber_pct: { min: 6, max: 10 },
    ca_to_p: { min: 1.4, max: 1.9 },
  },
  'Malý papoušek': {
    protein_pct: { min: 11, max: 15 },
    fat_pct: { min: 5, max: 9 },
    fiber_pct: { min: 5, max: 9 },
    ca_to_p: { min: 1.3, max: 1.8 },
  },
};

/**
 * Evaluate nutrient composition against category targets producing deviations with severity.
 * @param composition - Weighted composition of the recipe.
 * @param category - Category of the selected species.
 * @returns List of deviations including guidance direction.
 */
export function evaluateAgainstTargets(
  composition: RecipeComposition,
  category: SpeciesCategory,
): Deviation[] {
  const categoryTargets = CATEGORY_TARGETS[category];
  const results: Deviation[] = [];

  (Object.keys(categoryTargets) as Array<keyof CategoryTargets>).forEach((nutrientKey) => {
    const target = categoryTargets[nutrientKey];
    const actualValue = composition[nutrientKey];
    if (actualValue === null) {
      return;
    }
    if (actualValue < target.min || actualValue > target.max) {
      const outsideBy =
        actualValue < target.min
          ? ((target.min - actualValue) / target.min) * 100
          : ((actualValue - target.max) / target.max) * 100;
      const severity: 'WARN' | 'FAIL' = outsideBy > 15 ? 'FAIL' : 'WARN';
      results.push({
        nutrient: nutrientKey,
        actual: Number(actualValue.toFixed(2)),
        targetMin: target.min,
        targetMax: target.max,
        differencePct: Number(outsideBy.toFixed(1)),
        direction: actualValue < target.min ? 'increase' : 'decrease',
        severity,
      });
    }
  });

  return results;
}

/**
 * Roll up deviation severities into a single status string.
 * @param deviations - Deviations computed by {@link evaluateAgainstTargets}.
 * @returns Overall status string.
 */
export function resolveStatus(deviations: Deviation[]): 'OK' | 'WARN' | 'FAIL' {
  if (deviations.length === 0) {
    return 'OK';
  }
  return deviations.some((dev) => dev.severity === 'FAIL') ? 'FAIL' : 'WARN';
}
