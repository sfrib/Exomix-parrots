// utils/modeValidator.ts
import modes from "../data/modes.json";
import { NutrientTotals } from "./solver";

export interface ModeWarning {
  nutrient: string;
  value: number;
  expected: [number, number];
  message: string;
}

export function validateWithMode(nutrients: NutrientTotals, modeName: string): ModeWarning[] {
  const mode = modes.find(m => m.mode === modeName);
  if (!mode) return [];

  const warnings: ModeWarning[] = [];

  for (const key in mode.adjustments) {
    const [min, max] = mode.adjustments[key];
    const value = (nutrients as any)[key];
    if (typeof value !== "number") continue;

    if (value < min || value > max) {
      warnings.push({
        nutrient: key,
        value,
        expected: [min, max],
        message: `${key} je mimo rozsah: ${value} (očekává se ${min} – ${max})`
      });
    }
  }

  return warnings;
}
