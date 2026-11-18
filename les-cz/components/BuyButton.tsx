'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Props {
  productName: string;
  message: string;
  risky?: boolean;
  size?: 'sm' | 'lg';
}

/**
 * Parodické tlačítko KOUPIT.
 * Nic se neobjednává, nic se neukládá a nic se nikam neposílá – vše probíhá jen v prohlížeči.
 */
export default function BuyButton({ productName, message, risky = false, size = 'lg' }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [orderNo, setOrderNo] = useState<string>('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close();
    };
    dialog.addEventListener('click', onClick);
    return () => dialog.removeEventListener('click', onClick);
  }, []);

  function open() {
    // „Číslo objednávky“ je jen vtip – generuje se lokálně a nikde se neukládá.
    setOrderNo(`LES-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`);
    dialogRef.current?.showModal();
  }

  const btnClass = risky ? 'btn-danger' : 'btn-buy';
  const sizeClass = size === 'lg' ? 'px-8 py-3.5 text-base' : 'px-4 py-2 text-xs';

  return (
    <>
      <button type="button" onClick={open} className={`${btnClass} ${sizeClass} uppercase tracking-wider`}>
        <CartIcon className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        {risky ? 'Koupit?' : 'Koupit'}
        <span className="sr-only"> – {productName} (parodie, nic se nekupuje)</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="buy-title"
        className="w-[min(92vw,34rem)] rounded-2xl border border-forest-900/10 bg-sand-50 p-0 text-ink shadow-lift backdrop:bg-forest-950/60 backdrop:backdrop-blur-sm open:animate-pop"
      >
        <div className={`flex items-center gap-3 px-6 py-4 ${risky ? 'bg-berry-600' : 'bg-forest-800'} text-white`}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl" aria-hidden="true">
            {risky ? '⛔' : '✓'}
          </span>
          <div>
            <p id="buy-title" className="font-display text-xl font-semibold">
              {risky ? 'Objednávka zamítnuta' : 'Objednávka úspěšně přijata!*'}
            </p>
            {!risky && orderNo ? <p className="text-xs text-white/70">Číslo objednávky: {orderNo} (nikam se neukládá)</p> : null}
          </div>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-[15px] leading-relaxed">{message}</p>
          <div className="rounded-xl border border-bark-500/20 bg-white p-4 text-sm leading-relaxed text-ink/80">
            <strong className="text-forest-900">*Malé upozornění od lesní právní kanceláře:</strong> LES.cz není obchod.
            Nic neprodáváme, nic neodesíláme, nevzniká žádná objednávka ani kupní smlouva a neukládáme o vás žádné
            údaje. Tlačítko je součást vzdělávací parodie.
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/jak-sbirat" className="btn-primary" onClick={() => dialogRef.current?.close()}>
              Jak bezpečně sbírat
            </Link>
            <Link href="/podporit-lagunu" className="btn-ghost" onClick={() => dialogRef.current?.close()}>
              Dobrovolně podpořit Lagunu
            </Link>
            <button type="button" className="btn-ghost" onClick={() => dialogRef.current?.close()}>
              Zavřít
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </svg>
  );
}
