import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';

export default function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  tone = 'paper',
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
  tone?: 'paper' | 'danger';
}) {
  return (
    <header className={`${tone === 'danger' ? 'bg-berry-50' : 'paper-texture'} border-b border-forest-900/10`}>
      <div className="container-les py-10 md:py-14">
        <Breadcrumbs items={crumbs} />
        {eyebrow ? <p className={`eyebrow mt-6 ${tone === 'danger' ? 'text-berry-600' : ''}`}>{eyebrow}</p> : null}
        <h1 className={`mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl ${tone === 'danger' ? 'text-berry-700' : 'text-forest-900'}`}>{title}</h1>
        {lead ? <div className="mt-4 max-w-3xl text-lg leading-relaxed text-ink/75">{lead}</div> : null}
        {children}
      </div>
    </header>
  );
}
