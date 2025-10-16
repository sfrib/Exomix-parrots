import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '../../route';
import { Ingredient, Species } from '@/src/types/types';

interface TableData {
  species: Species[];
  ingredients: Ingredient[];
}

class FakeQuery {
  constructor(private table: keyof TableData, private store: TableData, private filters: ((row: any) => boolean)[] = []) {}

  select() {
    return this;
  }

  limit() {
    return this;
  }

  eq(field: string, value: unknown) {
    return new FakeQuery(this.table, this.store, [...this.filters, (row) => row[field] === value]);
  }

  ilike(field: string, value: string) {
    const normalized = value.toLowerCase();
    return new FakeQuery(this.table, this.store, [
      ...this.filters,
      (row) => String(row[field] ?? '').toLowerCase().includes(normalized),
    ]);
  }

  async maybeSingle() {
    const rows = this.applyFilters();
    return { data: rows[0] ?? null, error: null };
  }

  async in(field: string, values: number[]) {
    const set = new Set(values);
    const rows = this.applyFilters().filter((row) => set.has(row[field]));
    return { data: rows, error: null };
  }

  private applyFilters() {
    return this.store[this.table].filter((row) => this.filters.every((fn) => fn(row)));
  }
}

class FakeSupabaseClient {
  constructor(private store: TableData) {}

  from(table: keyof TableData) {
    return new FakeQuery(table, this.store);
  }
}

const sunflower: Ingredient = {
  id: 1,
  name: 'Slunečnice',
  category: 'olejnaté',
  protein_pct: 20,
  fat_pct: 35,
  fiber_pct: 15,
  moisture_pct: 8,
  calcium_pct: 0.3,
  phosphorus_pct: 0.4,
  price_per_kg: 50,
};

const pea: Ingredient = {
  id: 2,
  name: 'Hrách',
  category: 'luštěnina',
  protein_pct: 24,
  fat_pct: 5,
  fiber_pct: 12,
  moisture_pct: 10,
  calcium_pct: 0.15,
  phosphorus_pct: 0.4,
  price_per_kg: 35,
};

const species: Species = {
  id: 5,
  czechName: 'Ara ararauna',
  latinName: 'Ara ararauna',
  category: 'Velký ara',
  averageWeight_g: 1100,
  dietType: 'semenožravec',
  lifeStage: 'adult',
  seasonality: null,
};

declare module '@/src/lib/supabase' {
  function createReadonlyClient(): FakeSupabaseClient;
}

vi.mock('@/src/lib/supabase', () => ({
  createReadonlyClient: () => new FakeSupabaseClient({
    species: [species],
    ingredients: [sunflower, pea],
  }),
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
});

describe('POST /api/configurator', () => {
  it('validates the request body and returns descriptive errors', async () => {
    const req = new NextRequest('http://localhost/api/configurator', {
      method: 'POST',
      body: JSON.stringify({ goal: 'udržovací', items: [] }),
      headers: { 'content-type': 'application/json' },
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.field).toBe('weight_g');
  });

  it('returns report data and optimization when requested', async () => {
    const req = new NextRequest('http://localhost/api/configurator?optimize=1', {
      method: 'POST',
      body: JSON.stringify({
        speciesId: species.id,
        weight_g: 1100,
        goal: 'udržovací',
        items: [
          { ingredientId: sunflower.id, amount_g: 70 },
          { ingredientId: pea.id, amount_g: 30 },
        ],
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.report).toBeDefined();
    expect(payload.report.status).toBe('FAIL');
    expect(Array.isArray(payload.report.deviations)).toBe(true);
    expect(payload.optimization).toBeDefined();
    const total = payload.optimization.suggestedItems.reduce((sum: number, item: { amount_g: number }) => sum + item.amount_g, 0);
    expect(total).toBeCloseTo(100, 5);
  });
});
