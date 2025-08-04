// components/
interface Props {
  name: string;
  species: string;
  mode: string;
  mix: { name: string; percentage: number }[];
  nutrition: Record<string, number>;
}

export default function SaveToLocal({ name, species, mode, mix, nutrition }: Props) {
  const save = () => {
    const historyItem = {
      id: `mix-${Date.now()}`,
      name,
      species,
      mode,
      date: new Date().toISOString(),
      mix,
      nutrition
    };

    const existing = localStorage.getItem("exomix-history");
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.unshift(historyItem);
    localStorage.setItem("exomix-history", JSON.stringify(parsed));
    alert("Směs byla uložena do historie!");
  };

  return (
    <button onClick={save} className="bg-indigo-600 text-white px-4 py-2 rounded mt-4">
      Uložit směs do historie
    </button>
  );
}
