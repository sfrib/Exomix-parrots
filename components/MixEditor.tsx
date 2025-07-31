// components/MixEditor.tsx
import { useState } from "react";
import ingredients from "@/data/ingredients.json";
import profiles from "@/data/profiles.json";
import { solveNutrition, IngredientPortion } from "@/utils/solver";
import { validateMix } from "@/utils/validator";
import { validateWithMode } from "@/utils/modeValidator";

export default function MixEditor() {
  const [mix, setMix] = useState<IngredientPortion[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [mode, setMode] = useState<string>("běžný stav");

  const handleChange = (name: string, percentage: number) => {
    const updated = [...mix];
    const index = updated.findIndex(i => i.name === name);
    if (index !== -1) {
      updated[index].percentage = percentage;
    } else {
      updated.push({ name, percentage });
    }
    setMix(updated);
  };

  const nutrition = solveNutrition(mix);
  const warnings = validateMix(nutrition);
  const modeAlerts = validateWithMode(nutrition, mode);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mix Editor</h1>

      <label className="block mb-2">Vyber druh papouška:</label>
      <select
        className="border p-2 mb-4"
        value={selectedSpecies}
        onChange={e => setSelectedSpecies(e.target.value)}
      >
        <option value="">-- Vyber druh --</option>
        {profiles.map(p => (
          <option key={p.species} value={p.species}>{p.species}</option>
        ))}
      </select>

      <label className="block mb-2">Režim:</label>
      <select
        className="border p-2 mb-4"
        value={mode}
        onChange={e => setMode(e.target.value)}
      >
        <option value="běžný stav">běžný stav</option>
        <option value="hnízdění">hnízdění</option>
        <option value="línání">línání</option>
        <option value="rekonvalescence">rekonvalescence</option>
        <option value="hepatopatie">hepatopatie</option>
        <option value="zima">zima</option>
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {ingredients.map(i => (
          <div key={i.name} className="border p-2">
            <label>{i.name}</label>
            <input
              type="number"
              min={0}
              max={100}
              value={mix.find(m => m.name === i.name)?.percentage || 0}
              onChange={e => handleChange(i.name, Number(e.target.value))}
              className="w-full border px-2 py-1 mt-1"
            />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">Výživové hodnoty:</h2>
      <pre className="bg-gray-100 p-2 rounded mb-4">{JSON.stringify(nutrition, null, 2)}</pre>

      {warnings.length > 0 && (
        <div className="text-red-600 mb-4">
          <h3 className="font-semibold">Obecné varování:</h3>
          <ul>{warnings.map((w, i) => <li key={i}>⚠️ {w.message}</li>)}</ul>
        </div>
      )}

      {modeAlerts.length > 0 && (
        <div className="text-orange-600">
          <h3 className="font-semibold">Varování pro režim "{mode}":</h3>
          <ul>{modeAlerts.map((a, i) => <li key={i}>⚠️ {a.message}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
