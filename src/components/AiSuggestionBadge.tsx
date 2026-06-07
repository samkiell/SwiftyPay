'use client';

import { RefreshCw, Sparkles } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { suggestCoin, type Coin } from '@/lib/api';

interface AiSuggestionBadgeProps {
  /** The currently selected coin (to reflect when the suggestion is applied). */
  selected: Coin;
  /** Apply the recommended coin to the form. */
  onApply: (coin: Coin) => void;
}

/**
 * Real-time smart asset recommendation badge.
 * Asynchronously fetches GET /api/suggest-coin and renders the suggestion +
 * reason, with a one-tap action to apply it to the form. On failure it offers
 * a retry rather than disappearing, so the AI layer degrades gracefully.
 */
export function AiSuggestionBadge({ selected, onApply }: AiSuggestionBadgeProps) {
  const { data, loading, error, refetch } = useFetch(suggestCoin, []);

  const applied = data ? selected === data.suggestion : false;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        {loading ? (
          <p className="text-sm text-muted">Analysing market conditions…</p>
        ) : error ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted">Couldn&apos;t load a suggestion.</p>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
            </button>
          </div>
        ) : data ? (
          <>
            <p className="text-sm text-foreground">
              <span className="font-semibold text-accent">{data.suggestion}</span>{' '}
              recommended — <span className="text-muted">{data.reason}</span>
            </p>
            {applied ? (
              <span className="mt-1 inline-block text-xs font-semibold text-accent">
                ✓ Applied
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onApply(data.suggestion)}
                className="mt-1 text-xs font-semibold text-accent hover:underline"
              >
                Use {data.suggestion}
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AiSuggestionBadge;
