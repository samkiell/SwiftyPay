'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  /** Manually re-run the fetcher. */
  refetch: () => void;
}

/**
 * Generic async data hook for client components.
 *
 * Pass any async function (typically one of the helpers from `@/lib/api`).
 * Re-runs whenever a value in `deps` changes. Stale results from an
 * outdated invocation are discarded so the latest call always wins.
 *
 * @param fetcher async function producing the data
 * @param deps   dependency list; the fetcher re-runs when these change
 * @param immediate whether to run on mount (default true)
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  immediate = true,
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);

  // Track the latest run so out-of-order responses can't clobber state.
  const runId = useRef(0);

  const run = useCallback(() => {
    const id = ++runId.current;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (id === runId.current) setData(result);
      })
      .catch((err: unknown) => {
        if (id === runId.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (id === runId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  return { data, error, loading, refetch: run };
}

export default useFetch;
