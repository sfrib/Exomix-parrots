// utils/validator.ts
import { NutrientTotals } from "./solver";

export interface ValidationWarning {
  type: "warning" | "error";
  message: string;
}

export function validateMix(nutrients: NutrientTotals): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Tuk nad 20 %
  if (nutrients.fat > 20) {
    warnings.push({
      type: "warning",
      message: "Tuk ve směsi je vyšší než 20 %. Zvažte snížení pro jaterní podporu."
    });
  }

  // Slunečnice nad 10 % – řeší se mimo, zde jen nutričně

  // Poměr Ca:P
  const caToP = nutrients.calcium / (nutrients.phosphorus || 1);
  if (caToP < 1.3 || caToP > 2.5) {
    warnings.push({
      type: "error",
      message: `Poměr vápník : fosfor je nevhodný (${caToP.toFixed(2)}:1)`
    });
  }

  // Omega 6 : Omega 3
  const omegaRatio = nutrients.omega6 / (nutrients.omega3 || 1);
  if (omegaRatio > 15) {
    warnings.push({
      type: "warning",
      message: `Poměr Omega 6 : 3 je příliš vysoký (${omegaRatio.toFixed(1)} : 1)`
    });
  }

  // Vláknina pod 5 %
  if (nutrients.fiber < 5) {
    warnings.push({
      type: "warning",
      message: "Vláknina je pod 5 %, může vést ke zácpě."
    });
  }

  return warnings;
}
