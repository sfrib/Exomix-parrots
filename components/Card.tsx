
export default function Card({ title, children, actions }:{ title?:string; children:React.ReactNode; actions?:React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        {title && <div className="font-semibold">{title}</div>}
        {actions}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
