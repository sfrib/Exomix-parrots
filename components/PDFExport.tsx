// components/PDFExport.tsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { NutrientTotals } from "@/utils/solver";

interface Props {
  mixName: string;
  mix: { name: string; percentage: number }[];
  totals: NutrientTotals;
}

export default function PDFExport({ mixName, mix, totals }: Props) {
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Složení směsi – ${mixName}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Surovina", "% ve směsi"]],
      body: mix.map(i => [i.name, `${i.percentage} %`])
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Živina", "Hodnota"]],
      body: Object.entries(totals).map(([k, v]) => [k, v.toFixed(2)])
    });

    doc.setFontSize(12);
    doc.text("S láskou od ExoMixu 💛", 14, doc.internal.pageSize.height - 10);
    doc.save(`${mixName.replace(/\s+/g, "_")}_ExoMix.pdf`);
  };

  return (
    <button onClick={generatePDF} className="bg-green-500 text-white px-4 py-2 rounded">
      Exportovat do PDF
    </button>
  );
}
