// components/KubicekChat.tsx
import { useState } from "react";

export default function KubicekChat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = `🧑: ${input}`;
    const reply = getKubicekReply(input);

    setMessages(prev => [...prev, userMessage, `🦜 Kubíček: ${reply}`]);
    setInput("");
  };

  const getKubicekReply = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("játra")) return "Na játra bych ti tam hodil ostropestřec, co ty na to?";
    if (t.includes("vápník")) return "Korela v hnízdění? Calcium 2× týdně, kámo!";
    if (t.includes("vláknina")) return "Trochu vloček nebo mungo, a vláknina jede!";
    if (t.includes("tuk")) return "Bacha na slunečnici, moc tuku a bude mít břicho jak papuč.";
    if (t.includes("zim")) return "Přidej tuky, je zima, ať mu není zima i na zobáček!";
    return "To zní zajímavě. Co přesně máš na srdci?";
  };

  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h2 className="text-xl font-bold mb-2">Kubíček 🦜 – AI rádce</h2>
      <div className="h-40 overflow-y-auto bg-white p-2 border mb-2 rounded">
        {messages.map((m, i) => (
          <div key={i} className="text-sm whitespace-pre-wrap mb-1">{m}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Zeptej se na složení, zdraví, režim…"
        />
        <button type="submit" className="bg-yellow-400 px-4 py-1 rounded">Odeslat</button>
      </form>
    </div>
  );
}
