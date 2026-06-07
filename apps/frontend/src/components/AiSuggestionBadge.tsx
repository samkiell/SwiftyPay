'use client';

import { Sparkles } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { suggestCoin, type Coin } from '@/lib/api';

interface AiSuggestionBadgeProps {
  /** Apply the recommended coin to the form. */
  onApply: (coin: Coin) => void;
}

/**
 * Real-time smart asset recommendation badge.
 * Asynchronously fetches GET /api/suggest-coin and renders the suggestion +
 * reason, with a one-tap action to apply it to the form.
 */
export function AiSuggestionBadge({ onApply }: AiSuggestionBadgeProps) {
  const { data, loading, error } = useFetch(suggestCoin, []);

  // Fail silently — the AI layer is an enhancement, not a blocker.
  if (error) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        {loading ? (
          <p className="text-sm text-muted">Analysing market conditions…</p>
        ) : data ? (
          <>
            <p className="text-sm text-foreground">
              <span className="font-semibold text-accent">{data.suggestion}</span>{' '}
              recommended — <span className="text-muted">{data.reason}</span>
            </p>
            <button
              type="button"
              onClick={() => onApply(data.suggestion)}
              className="mt-1 text-xs font-semibold text-accent hover:underline"
            >
              Use {data.suggestion}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AiSuggestionBadge;
