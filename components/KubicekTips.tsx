// components/KubicekTips.tsx
import { useEffect, useState } from "react";

const TIPS = [
  "Na játra bych ti tam hodil ostropestřec, co ty na to?",
  "Máš tam málo vlákniny, přidej trochu vloček nebo mungo!",
  "Korela v hnízdění? Calcium 2× týdně, kámo!",
  "Omega 3 jak šafránu? Rakytníkový olej to jistí!",
  "Zima? Trochu víc tuku, ať mu není zima i na zobáček!",
  "Složení je fajn, ale pořádně to promíchej, jo?",
  "Slunečnice není odpověď na všechno. Fakt ne.",
  "Nezapomeň – směs není polívka. 100 % je limit!",
  "Tvoje andulka by z tebe měla radost. Ještě jód a je to."
];

export default function KubicekTips() {
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * TIPS.length);
      setTip(TIPS[random]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 mt-6">
      <p className="text-sm text-gray-800 italic">🦜 Kubíček radí: „{tip}“</p>
    </div>
  );
}
