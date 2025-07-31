// utils/solver.ts
import ingredients from "../data/ingredients.json";

export interface IngredientPortion {
  name: string;
  percentage: number; // např. 25 pro 25 %
}

export interface NutrientTotals {
  protein: number;
  fat: number;
  fiber: number;
  carbs: number;
  calcium: number;
  phosphorus: number;
  omega3?: number;
  omega6?: number;
  energy?: number;
}

export function solveNutrition(mix: IngredientPortion[]): NutrientTotals {
  const total: NutrientTotals = {
    protein: 0,
    fat: 0,
    fiber: 0,
    carbs: 0,
    calcium: 0,
    phosphorus: 0,
    omega3: 0,
    omega6: 0,
    energy: 0
  };

  mix.forEach(portion => {
    const ingredient = ingredients.find(i => i.name === portion.name);
    if (!ingredient) return;
    const factor = portion.percentage / 100;

    total.protein += ingredient.protein * factor;
    total.fat += ingredient.fat * factor;
    total.fiber += ingredient.fiber * factor;
    total.carbs += ingredient.carbs * factor;
    total.calcium += (ingredient.calcium || 0) * factor;
    total.phosphorus += (ingredient.phosphorus || 0) * factor;
    total.omega3 += (ingredient.omega3 || 0) * factor;
    total.omega6 += (ingredient.omega6 || 0) * factor;
    total.energy += (ingredient.energy || 0) * factor;
  });

  return total;
}
