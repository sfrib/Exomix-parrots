import { describe, expect, it } from 'vitest';

import { optimizeBlend } from '../optimizer';
import { computeBlend } from '../nutrition';
import { Ingredient, RecipeItemInput, Species } from '../../types/types';

const species: Species = {
  id: 1,
  czechName: 'Ara chloropterus',
  latinName: 'Ara chloropterus',
  category: 'Velký ara',
  averageWeight_g: 1100,
  dietType: 'semenožravec',
  lifeStage: 'adult',
  seasonality: null,
};

const lowProtein: Ingredient = {
  id: 1,
  name: 'Pšenice',
  category: 'obilovina',
  protein_pct: 9,
  fat_pct: 4,
  fiber_pct: 5,
  moisture_pct: 10,
  calcium_pct: 0.05,
  phosphorus_pct: 0.3,
  price_per_kg: 20,
};

const highProtein: Ingredient = {
  id: 2,
  name: 'Sója',
  category: 'luštěnina',
  protein_pct: 28,
  fat_pct: 12,
  fiber_pct: 10,
  moisture_pct: 12,
  calcium_pct: 0.2,
  phosphorus_pct: 0.4,
  price_per_kg: 55,
};

const highFat: Ingredient = {
  id: 3,
  name: 'Lísková jádra',
  category: 'olejnaté semeno',
  protein_pct: 15,
  fat_pct: 45,
  fiber_pct: 8,
  moisture_pct: 6,
  calcium_pct: 0.3,
  phosphorus_pct: 0.3,
  price_per_kg: 80,
};

describe('optimizeBlend', () => {
  it('increases high-protein ingredients when below target', () => {
    const items: Array<RecipeItemInput & { ingredient: Ingredient }> = [
      { ingredientId: lowProtein.id, amount_g: 70, ingredient: lowProtein },
      { ingredientId: highProtein.id, amount_g: 30, ingredient: highProtein },
    ];
    const before = computeBlend(items, { species, goal: 'udržovací' });
    expect(before.protein_pct).toBeLessThan(14);

    const { suggestedItems, composition } = optimizeBlend({ items, species, goal: 'udržovací' });
    const soyShare = suggestedItems.find((item) => item.ingredientId === highProtein.id);
    expect(soyShare?.amount_g ?? 0).toBeGreaterThan(30);
    expect(composition.protein_pct).toBeGreaterThan(before.protein_pct);
    const total = suggestedItems.reduce((sum, item) => sum + item.amount_g, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it('reduces high-fat ingredients when fat exceeds targets', () => {
    const items: Array<RecipeItemInput & { ingredient: Ingredient }> = [
      { ingredientId: highFat.id, amount_g: 60, ingredient: highFat },
      { ingredientId: lowProtein.id, amount_g: 40, ingredient: lowProtein },
    ];
    const before = computeBlend(items, { species, goal: 'udržovací' });
    expect(before.fat_pct).toBeGreaterThan(12);

    const { suggestedItems, composition } = optimizeBlend({ items, species, goal: 'udržovací' });
    const nutShare = suggestedItems.find((item) => item.ingredientId === highFat.id);
    expect(nutShare?.amount_g ?? 0).toBeLessThan(60);
    expect(composition.fat_pct).toBeLessThan(before.fat_pct);
    const total = suggestedItems.reduce((sum, item) => sum + item.amount_g, 0);
    expect(total).toBeCloseTo(100, 5);
  });
});
