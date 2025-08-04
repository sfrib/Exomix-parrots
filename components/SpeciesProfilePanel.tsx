// components/SpeciesProfilePanel.tsx
import profiles from "@/data/profiles.json";

interface Props {
  species: string;
}

export default function SpeciesProfilePanel({ species }: Props) {
  const profile = profiles.find((p) => p.species === species);
  if (!profile) return null;

  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 mt-6">
      <h3 className="text-lg font-semibold mb-1">🦜 {profile.species}</h3>
      <p className="text-sm text-gray-700 italic mb-1">
        Latinsky: <span className="not-italic">{profile.scientific}</span>
      </p>
      <p className="text-sm">Průměrná váha: {profile.averageWeight} g</p>
      <p className="text-sm">Denní příjem: cca {profile.defaultIntake} g</p>
      <p className="text-sm mt-2 text-gray-800">📌 {profile.notes}</p>
    </div>
  );
}

