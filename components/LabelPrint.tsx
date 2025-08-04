// components/LabelPrint.tsx
import jsPDF from "jspdf";

interface Props {
  name: string;
  species: string;
  date: string;
  mix: { name: string; percentage: number }[];
}

export default function LabelPrint({ name, species, date, mix }: Props) {
  const print = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [80, 50] });
    doc.setFontSize(12);
    doc.text(`ExoMix – ${name}`, 5, 10);
    doc.setFontSize(10);
    doc.text(`Druh: ${species}`, 5, 16);
    doc.text(`Datum: ${new Date(date).toLocaleDateString()}`, 5, 21);
    doc.setFontSize(9);

    mix.slice(0, 5).forEach((item, i) => {
      doc.text(`${item.name}: ${item.percentage}%`, 5, 28 + i * 5);
    });

    doc.text("S láskou od ExoMixu 💛", 5, 48);
    doc.save(`stitek_${name.replaceAll(" ", "_")}.pdf`);
  };

  return (
    <button onClick={print} className="bg-yellow-500 text-white px-4 py-2 rounded mt-4">
      Vytisknout štítek
    </button>
  );
}
