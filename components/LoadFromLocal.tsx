// components/
import { useEffect, useState } from "react";

interface Props {
  onLoad: (item: any) => void;
}

export default function LoadFromLocal({ onLoad }: Props) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("exomix-history");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Chyba při načítání historie:", e);
      }
    }
  }, []);

  if (!items.length) return null;

  return (
    <div className="p-4 border rounded bg-white mt-6">
      <h2 className="text-lg font-bold mb-2">Moje uložené směsi (lokální)</h2>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="py-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleString()} | {item.species} | {item.mode}
                </p>
              </div>
              <button
                onClick={() => onLoad(item)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Načíst
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
