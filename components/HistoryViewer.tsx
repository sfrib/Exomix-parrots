// components/HistoryViewer.tsx
import history from "@/data/history.json";

interface Props {
  onLoad: (mix: any) => void;
}

export default function HistoryViewer({ onLoad }: Props) {
  return (
    <div className="p-4 border rounded bg-white mt-6">
      <h2 className="text-xl font-bold mb-2">Historie směsí</h2>
      <ul className="divide-y">
        {history.map((item) => (
          <li key={item.id} className="py-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()} | {item.species} | {item.mode}</p>
              </div>
              <button
                onClick={() => onLoad(item)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
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

