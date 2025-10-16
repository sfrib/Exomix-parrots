'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick?: () => Promise<void> | void;
  disabled?: boolean;
  icon?: ReactNode;
  title?: string;
};

export default function Button({ children, variant='primary', onClick, disabled, icon, title }: Props) {
  const [loading, setLoading] = useState(false);
  const cls = variant === 'primary' ? 'btn btn-primary' :
              variant === 'secondary' ? 'btn btn-secondary' :
              variant === 'danger' ? 'btn btn-danger' :
              'btn btn-ghost';
  async function handle() {
    if (!onClick) return;
    setLoading(true);
    try { await onClick(); } finally { setLoading(false); }
  }
  return (
    <button title={title} className={`${cls} ${loading || disabled ? 'btn-disabled' : ''}`} onClick={handle} disabled={loading||disabled}>
      {loading ? <span className="animate-spin">⏳</span> : icon}{children}
    </button>
  );
}
