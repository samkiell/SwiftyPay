'use client';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  coin: string;
}

/** Numerical amount field with a leading coin chip. */
export function AmountInput({ value, onChange, coin }: AmountInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">Amount</span>
      <div className="relative flex items-center">
        <input
          inputMode="decimal"
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sp-focus w-full rounded-2xl border border-border bg-surface px-4 py-4 pr-20 text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted/50"
        />
        <span className="absolute right-4 rounded-lg bg-surface-elevated px-2.5 py-1 text-sm font-semibold text-muted">
          {coin}
        </span>
      </div>
    </label>
  );
}

export default AmountInput;
