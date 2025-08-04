// components/ModeInfoPanel.tsx
interface Props {
  mode: string;
}

const INFO: Record<string, string> = {
  "běžný stav": "Základní směs pro údržbu zdraví. Vyvážený poměr živin.",
  "hnízdění": "Zvýšené nároky na vápník, bílkoviny a tuk. Doporučeno přidat oleje a Ca.",
  "línání": "Potřeba aminokyselin a vlákniny pro obnovu peří.",
  "rekonvalescence": "Vysoké nároky na energii, bílkoviny a Omega 3. Vhodné pro zotavení.",
  "hepatopatie": "Nízký tuk, vysoká vláknina, podpora jater – ostropestřec, omega 3.",
  "zima": "Zvýšený příjem tuku a energie. Vhodné oleje a slunečnice."
};

export default function ModeInfoPanel({ mode }: Props) {
  if (!mode || !INFO[mode]) return null;
  return (
    <div className="p-4 bg-purple-50 border-l-4 border-purple-400 mt-6">
      <h3 className="text-lg font-semibold mb-1">🧬 Režim: {mode}</h3>
      <p className="text-sm text-gray-800">{INFO[mode]}</p>
    </div>
  );
}
