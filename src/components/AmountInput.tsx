'use client';

import type { Coin } from '@/lib/api';
import { sanitizeAmount } from '@/lib/amount';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  coin: Coin;
  /** Inline validation error to surface beneath the field. */
  error?: string | null;
}

/**
 * Numerical amount field with a leading coin chip.
 * Input is sanitised on every keystroke so only a clean decimal string,
 * clamped to the asset's precision, ever reaches form state.
 */
export function AmountInput({ value, onChange, coin, error }: AmountInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">Amount</span>
      <div className="relative flex items-center">
        <input
          inputMode="decimal"
          // `text` (not `number`) so our sanitiser fully controls the value and
          // mobile keyboards don't insert locale separators we can't read.
          type="text"
          autoComplete="off"
          placeholder="0.00"
          aria-invalid={error ? 'true' : 'false'}
          value={value}
          onChange={(e) => onChange(sanitizeAmount(e.target.value, coin))}
          className={`sp-focus w-full rounded-2xl border bg-surface px-4 py-4 pr-20 text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted/50 ${
            error ? 'border-danger' : 'border-border'
          }`}
        />
        <span className="absolute right-4 rounded-lg bg-surface-elevated px-2.5 py-1 text-sm font-semibold text-muted">
          {coin}
        </span>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </label>
  );
}

export default AmountInput;
