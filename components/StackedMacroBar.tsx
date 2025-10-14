
type Part = { label: string; value: number };
export default function StackedMacroBar({ data, total=100 }:{ data: Part[]; total?: number }){
  const width = 320, height = 24;
  let x = 0;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-6 border rounded">
      {data.map((p,i)=>{
        const w = (p.value/total)*width;
        const rect = <rect key={i} x={x} y={0} width={w} height={height} fill={`hsl(${(i*57)%360} 70% 45%)`} />;
        x += w;
        return rect;
      })}
    </svg>
  );
}
