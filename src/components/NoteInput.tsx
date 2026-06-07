'use client';

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

/** Optional, character-limited note textarea. */
export function NoteInput({ value, onChange, maxLength = 140 }: NoteInputProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-medium text-muted">
        Note <span className="font-normal text-muted/70">optional</span>
      </span>
      <div className="relative">
        <textarea
          rows={3}
          maxLength={maxLength}
          placeholder="What's this for? e.g. For logo design"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sp-focus w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted/50"
        />
        <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-muted/70">
          {value.length}/{maxLength}
        </span>
      </div>
    </label>
  );
}

export default NoteInput;
