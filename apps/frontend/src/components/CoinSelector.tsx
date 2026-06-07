'use client';

import { useEffect, useRef, useState } from 'react';
import { Bitcoin, Check, ChevronDown, CircleDollarSign, Coins } from 'lucide-react';
import type { Coin } from '@/lib/api';

interface CoinSelectorProps {
  value: Coin;
  onChange: (coin: Coin) => void;
}

const COINS: { id: Coin; label: string; icon: typeof Coins }[] = [
  { id: 'USDT', label: 'Tether USD', icon: CircleDollarSign },
  { id: 'BTC', label: 'Bitcoin', icon: Bitcoin },
  { id: 'ETH', label: 'Ethereum', icon: Coins },
];

/** Custom dropdown selector for the supported assets (USDT, BTC, ETH). */
export function CoinSelector({ value, onChange }: CoinSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const active = COINS.find((c) => c.id === value) ?? COINS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="block" ref={ref}>
      <span className="mb-2 block text-sm font-medium text-muted">Asset</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="sp-focus flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4 text-left"
        >
          <span className="flex items-center gap-3">
            <ActiveIcon className="h-5 w-5 text-accent" aria-hidden />
            <span className="font-semibold text-foreground">{active.id}</span>
            <span className="text-sm text-muted">{active.label}</span>
          </span>
          <ChevronDown
            className={`h-5 w-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="sp-card absolute z-10 mt-2 w-full overflow-hidden p-1.5"
          >
            {COINS.map((coin) => {
              const Icon = coin.icon;
              const selected = coin.id === value;
              return (
                <li key={coin.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(coin.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-surface-elevated"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-accent" aria-hidden />
                      <span className="font-semibold text-foreground">{coin.id}</span>
                      <span className="text-sm text-muted">{coin.label}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 text-accent" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CoinSelector;
