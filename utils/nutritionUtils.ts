// utils/nutritionUtils.ts

export function calculateOmegaRatio(omega3: number, omega6: number): string {
  if (!omega3 || !omega6) return "N/A";
  const ratio = omega6 / omega3;
  return `1:${ratio.toFixed(1)}`;
}

export function calculateCaToP(ca: number, p: number): string {
  if (!ca || !p) return "N/A";
  const ratio = ca / p;
  return `${ratio.toFixed(2)}:1`;
}

export function isBalancedCaToP(ca: number, p: number): boolean {
  const ratio = ca / p;
  return ratio >= 1.5 && ratio <= 2.5; // zdravý rozsah pro ptáky
}

export function roundNutrition(value: number, decimals = 1): number {
  return parseFloat(value.toFixed(decimals));
}

export function normalizeTotal(total: number): number {
  return Math.round(total * 1000) / 10; // vrátí např. 25.3
}
