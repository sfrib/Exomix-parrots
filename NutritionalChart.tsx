// components/NutritionalChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { NutrientTotals } from "@/utils/solver";

interface Props {
  totals: NutrientTotals;
}

export default function NutritionalChart({ totals }: Props) {
  const data = [
    { name: "Protein", value: totals.protein },
    { name: "Fat", value: totals.fat },
    { name: "Fiber", value: totals.fiber },
    { name: "Carbs", value: totals.carbs },
    { name: "Calcium", value: totals.calcium },
    { name: "Phosphorus", value: totals.phosphorus },
    { name: "Omega 3", value: totals.omega3 },
    { name: "Omega 6", value: totals.omega6 },
    { name: "Energy", value: totals.energy }
  ];

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">Graf výživových hodnot</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#8884d8" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
