
type Slice = { label: string; value: number };
export default function CompositionDonut({ data, total = 100 }:{ data: Slice[]; total?: number }){
  const sum = data.reduce((a,b)=>a+b.value,0);
  let acc = 0;
  const radius = 70, cx = 80, cy = 80, stroke = 20;
  function arc(value:number){
    const angle = (value/total)*2*Math.PI;
    const x1 = cx + radius * Math.cos((acc/total)*2*Math.PI - Math.PI/2);
    const y1 = cy + radius * Math.sin((acc/total)*2*Math.PI - Math.PI/2);
    acc += value;
    const x2 = cx + radius * Math.cos((acc/total)*2*Math.PI - Math.PI/2);
    const y2 = cy + radius * Math.sin((acc/total)*2*Math.PI - Math.PI/2);
    const largeArc = value/total > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }
  return (
    <svg viewBox="0 0 160 160" className="w-full h-auto">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e6ecf2" strokeWidth={stroke} />
      {data.map((s, i) => (
        <path key={i} d={arc(s.value)} fill="none" strokeWidth={stroke} strokeLinecap="butt" stroke={`hsl(${(i*57)%360} 70% 45%)`} />
      ))}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="600">{sum}%</text>
    </svg>
  );
}
