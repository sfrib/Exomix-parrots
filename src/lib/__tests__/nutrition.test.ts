import { describe, expect, it } from 'vitest';

import { calcCaPRatio, computeBlend, estimateDailyIntake } from '../nutrition';
import { Ingredient, RecipeItemInput, Species } from '../../types/types';

const species: Species = {
  id: 1,
  czechName: 'Ara ararauna',
  latinName: 'Ara ararauna',
  category: 'Velký ara',
  averageWeight_g: 1100,
  dietType: 'semenožravec',
  lifeStage: 'adult',
  seasonality: null,
};

const sunflower: Ingredient = {
  id: 10,
  name: 'Slunečnice černá',
  category: 'olejnaté semeno',
  protein_pct: 20,
  fat_pct: 35,
  fiber_pct: 18,
  moisture_pct: 7,
  calcium_pct: 0.3,
  phosphorus_pct: 0.5,
  price_per_kg: 45,
};

const millet: Ingredient = {
  id: 11,
  name: 'Proso žluté',
  category: 'obilovina',
  protein_pct: 12,
  fat_pct: 4,
  fiber_pct: 6,
  moisture_pct: 10,
  calcium_pct: 0.05,
  phosphorus_pct: 0.3,
  price_per_kg: 30,
};

describe('estimateDailyIntake', () => {
  it('scales with weight and rounds to one decimal place', () => {
    expect(estimateDailyIntake(1100, 'udržovací')).toBeCloseTo(88);
    expect(estimateDailyIntake(1100, 'růst')).toBeCloseTo(132);
  });
});

describe('calcCaPRatio', () => {
  it('returns null when phosphorus is zero or less', () => {
    expect(calcCaPRatio(0.5, 0)).toBeNull();
  });

  it('calculates the ratio with two decimal precision', () => {
    expect(calcCaPRatio(0.6, 0.3)).toBe(2);
  });
});

describe('computeBlend', () => {
  const items: Array<RecipeItemInput & { ingredient: Ingredient }> = [
    { ingredientId: sunflower.id, amount_g: 60, ingredient: sunflower },
    { ingredientId: millet.id, amount_g: 40, ingredient: millet },
  ];

  it('produces weighted averages for macro nutrients', () => {
    const composition = computeBlend(items, { species, goal: 'udržovací' });
    expect(composition.protein_pct).toBeCloseTo(16.8);
    expect(composition.fat_pct).toBeCloseTo(22.6);
    expect(composition.fiber_pct).toBeCloseTo(13.2);
  });

  it('computes Ca:P ratio and cost per day', () => {
    const composition = computeBlend(items, { species, goal: 'udržovací' });
    expect(composition.ca_to_p).toBeCloseTo(0.48, 2);
    expect(composition.cost_per_day).toBeCloseTo(3.43, 2);
    expect(composition.dry_matter_intake_g).toBeCloseTo(88);
  });
});
