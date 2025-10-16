import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function Card({ title, children, actions }: CardProps) {
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
